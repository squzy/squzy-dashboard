import {
  Component,
  OnInit,
  Input,
  OnChanges,
  SimpleChanges,
  ChangeDetectionStrategy,
  OnDestroy,
} from '@angular/core';
import { BehaviorSubject, Subject, Observable, combineLatest } from 'rxjs';
import { filter, switchMap, share, map, takeUntil } from 'rxjs/operators';
import { ChartOptions } from 'chart.js';
import { AgentsService } from 'src/app/modules/agents/services/agents.service';
import { timeToDate, FormRangeValue } from 'src/app/shared/date/date';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'sqd-memory-stat',
  templateUrl: './memory-stat.component.html',
  styleUrls: ['./memory-stat.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MemoryStatComponent implements OnChanges, OnDestroy {
  private destroyed$ = new Subject();

  @Input() agentId: string;

  @Input() range: FormRangeValue;

  private range$ = new BehaviorSubject<FormRangeValue>(null);

  private _agentId$ = new BehaviorSubject(null);

  private MEMORY_TYPES = {
    [AgentsService.VIRTUAL_MEMORY]: [
      AgentsService.FREE_MEMORY,
      AgentsService.USAGE_MEMORY,
      AgentsService.TOTAL_MEMORY,
      AgentsService.SHARED_MEMORY,
    ],
    [AgentsService.SWAP_MEMORY]: [
      AgentsService.FREE_MEMORY,
      AgentsService.USAGE_MEMORY,
      AgentsService.TOTAL_MEMORY,
    ],
  };

  memoryTypes = Object.keys(this.MEMORY_TYPES);

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

  optionsByType: { [key: string]: ChartOptions } = this.memoryTypes.reduce((prev, cur) => {
    prev[cur] = {
      ...this._defaultOptions,
      title: {
        display: true,
        text: `${cur} ${this.translateService.instant(
          'MODULES.STATS.MEMORY.MEMORY',
        )}`.toUpperCase(),
      },
    } as ChartOptions;
    return prev;
  }, {});

  private getMemoryStream$ = combineLatest(
    this._agentId$.pipe(filter((v) => !!v)),
    this.range$.pipe(filter((v) => !!v)),
  ).pipe(
    switchMap(([agentId, range]) =>
      this.agentsService.getMemoryStats(agentId, range.dateFrom, range.dateTo),
    ),
    takeUntil(this.destroyed$),
  );

  memoryCharts$ = this.getMemoryStream$.pipe(
    map((stats) => {
      if (!stats) {
        return {
          labels: [],
        };
      }
      const labels = [];
      const _map = this.memoryTypes.reduce((prev, cur) => {
        prev[cur] = this.MEMORY_TYPES[cur].reduce((p, c) => {
          p[c] = [];
          return p;
        }, {});
        return prev;
      }, {});

      stats.forEach((item) => {
        labels.push(timeToDate(item.time));
        _map[AgentsService.VIRTUAL_MEMORY][AgentsService.FREE_MEMORY].push(
          item.memory_info.mem.free,
        );
        _map[AgentsService.VIRTUAL_MEMORY][AgentsService.USAGE_MEMORY].push(
          item.memory_info.mem.used,
        );
        _map[AgentsService.SWAP_MEMORY][AgentsService.FREE_MEMORY].push(item.memory_info.swap.free);
        _map[AgentsService.SWAP_MEMORY][AgentsService.USAGE_MEMORY].push(
          item.memory_info.swap.used,
        );
        _map[AgentsService.VIRTUAL_MEMORY][AgentsService.TOTAL_MEMORY].push(
          item.memory_info.mem.total,
        );
        _map[AgentsService.SWAP_MEMORY][AgentsService.TOTAL_MEMORY].push(
          item.memory_info.swap.total,
        );
        _map[AgentsService.VIRTUAL_MEMORY][AgentsService.SHARED_MEMORY].push(
          item.memory_info.mem.shared,
        );
      });

      return {
        labels,
        ...this.memoryTypes.reduce((prev, cur) => {
          prev[cur] = {
            dataset: this.MEMORY_TYPES[cur].map((subType) => ({
              data: _map[cur][subType],
              label: subType.toUpperCase(),
              lineTension: 0,
            })),
          };
          return prev;
        }, {}),
      };
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
