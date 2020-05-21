import {
  Component,
  OnInit,
  Input,
  OnChanges,
  SimpleChanges,
  ChangeDetectionStrategy,
} from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { filter, switchMap, share, map } from 'rxjs/operators';
import { ChartOptions } from 'chart.js';
import { AgentsService } from 'src/app/modules/agents/services/agents.service';
import { timeToDate } from 'src/app/shared/date/date';

@Component({
  selector: 'sqd-memory-stat',
  templateUrl: './memory-stat.component.html',
  styleUrls: ['./memory-stat.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MemoryStatComponent implements OnChanges {
  @Input() agentId: string;

  private _agentId$ = new BehaviorSubject(this.agentId);

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

          ticks: {
            source: 'data',
          },
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
        text: `${cur} memory`.toUpperCase(),
      },
    } as ChartOptions;
    return prev;
  }, {});

  private getMemoryStream$ = this._agentId$.pipe(
    filter((v) => !!v),
    switchMap((agentId) => this.agentsService.getMemoryStats(agentId)),
  );

  memoryCharts$ = this.getMemoryStream$.pipe(
    map((stats) => {
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
  );

  constructor(private agentsService: AgentsService) {}

  ngOnChanges(changes: SimpleChanges) {
    if ('agentId' in changes) {
      this._agentId$.next(changes.agentId.currentValue);
    }
  }
}
