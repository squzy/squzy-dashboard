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
import { FormRangeValue } from 'src/app/shared/date/date';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'sqd-cpu-stats',
  templateUrl: './cpu-stats.component.html',
  styleUrls: ['./cpu-stats.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CpuStatsComponent implements OnChanges, OnDestroy {
  private destroyed$ = new Subject();

  @Input() agentId: string;

  @Input() range: FormRangeValue;

  private range$ = new BehaviorSubject<FormRangeValue>(null);

  private _agentId$ = new BehaviorSubject(null);

  options: ChartOptions = {
    scales: {
      xAxes: [
        {
          type: 'time',
          time: {
            unit: 'minute',
          },
          stacked: true,
          ticks: {
            beginAtZero: true,
          },
          display: true,
        },
      ],
      yAxes: [
        {
          ticks: {
            max: 1,
            min: 0,
          },
        },
      ],
    },
  };

  data$ = combineLatest(
    this._agentId$.pipe(filter((v) => !!v)),
    this.range$.pipe(filter((v) => !!v)),
  ).pipe(
    switchMap(([agentId, range]) =>
      this.agentsService.getCpuStats(agentId, range.dateFrom, range.dateTo),
    ),
    map((history) => {
      if (!history) {
        return [];
      }
      const length = history[0].cpu_info.cpus.length;

      const datasets = Array(length)
        .fill(0)
        .map((_, index) => []);

      const labels = [];
      history.forEach((item) => {
        labels.push(item.time.seconds * 1000);
        item.cpu_info.cpus.forEach((cpu, index) => {
          datasets[index].push(cpu.load / 100);
        });
      });

      return datasets.map((item, index) => ({
        labels,
        dataset: [
          {
            data: item,
            label: `${this.translateService.instant('MODULES.STATS.CPU.CPU')} ${index + 1}`,
            lineTension: 0,
          },
        ],
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
