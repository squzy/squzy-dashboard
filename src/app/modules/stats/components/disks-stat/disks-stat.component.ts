import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  ChangeDetectionStrategy,
  OnDestroy,
} from '@angular/core';
import { BehaviorSubject, Subject, Observable, combineLatest } from 'rxjs';
import { filter, switchMap, map, takeUntil } from 'rxjs/operators';
import { ChartOptions } from 'chart.js';
import { AgentsService } from 'src/app/modules/agents/services/agents.service';
import { timeToDate, FormRangeValue } from 'src/app/shared/date/date';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'sqd-disks-stat',
  templateUrl: './disks-stat.component.html',
  styleUrls: ['./disks-stat.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DisksStatComponent implements OnChanges, OnDestroy {
  private destroyed$ = new Subject();

  @Input() agentId: string;

  @Input() range: FormRangeValue;

  private range$ = new BehaviorSubject<FormRangeValue>(null);

  private _agentId$ = new BehaviorSubject(null);

  private getDiskStream$ = combineLatest(
    this._agentId$.pipe(filter((v) => !!v)),
    this.range$.pipe(filter((v) => !!v)),
  ).pipe(
    switchMap(([agentId, range]) =>
      this.agentsService.getDisksStats(agentId, range.dateFrom, range.dateTo),
    ),
    takeUntil(this.destroyed$),
  );

  private _defaultOptions: ChartOptions = {
    scales: {
      xAxes: [
        {
          type: 'time',
          time: {
            unit: 'minute',
          },
          stacked: true,
          display: true,
        },
      ],
      yAxes: [
        {
          ticks: {
            min: 0,
          },
        },
      ],
    },
  };

  types = [AgentsService.FREE_MEMORY, AgentsService.USAGE_MEMORY, AgentsService.TOTAL_MEMORY];

  disksCharts$ = this.getDiskStream$.pipe(
    map((stats) => {
      if (!stats) {
        return [];
      }
      const labels = [];
      const datasets = {};
      stats.forEach((item) => {
        labels.push(timeToDate(item.time));
        Object.keys(item.disk_info.disks).forEach((diskStat) => {
          if (!datasets[diskStat]) {
            datasets[diskStat] = {
              [AgentsService.FREE_MEMORY]: [item.disk_info.disks[diskStat].free],
              [AgentsService.USAGE_MEMORY]: [item.disk_info.disks[diskStat].used],
              [AgentsService.TOTAL_MEMORY]: [item.disk_info.disks[diskStat].total],
            };
            return;
          }
          datasets[diskStat][AgentsService.FREE_MEMORY].push(item.disk_info.disks[diskStat].free);
          datasets[diskStat][AgentsService.USAGE_MEMORY].push(item.disk_info.disks[diskStat].used);
          datasets[diskStat][AgentsService.TOTAL_MEMORY].push(item.disk_info.disks[diskStat].total);
        });
      });

      return Object.keys(datasets).map((disk) => ({
        options: {
          ...this._defaultOptions,
          title: {
            display: true,
            text: `${this.translateService.instant('MODULES.STATS.DISK.PATH')}: ${disk}`,
          },
        },
        labels,
        datasets: this.types.map((type) => ({
          data: datasets[disk][type],
          label: type.toUpperCase(),
          lineTension: 0,
        })),
      }));
    }),
    takeUntil(this.destroyed$),
  );

  constructor(private agentsService: AgentsService, private translateService: TranslateService) {}

  ngOnChanges(changes: SimpleChanges) {
    if ('agentId' in changes) {
      this._agentId$.next(changes.agentId.currentValue);
    }

    if ('range' in changes) {
      this.range$.next(changes.range.currentValue);
    }
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}
