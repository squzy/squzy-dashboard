import {
  Component,
  Input,
  SimpleChanges,
  OnChanges,
  ChangeDetectionStrategy,
  OnDestroy,
} from '@angular/core';
import { BehaviorSubject, timer, Subject } from 'rxjs';
import { filter, switchMap, map, tap, takeUntil, share } from 'rxjs/operators';
import { ChartOptions } from 'chart.js';
import { AgentsService } from 'src/app/modules/agents/services/agents.service';
import { AgentStatus } from 'src/app/shared/enums/agent.type';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'sqd-live-stat',
  templateUrl: './live-stat.component.html',
  styleUrls: ['./live-stat.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LiveStatComponent implements OnChanges, OnDestroy {
  private destroyed$ = new Subject();

  @Input() agentId: string;

  private _agentId$ = new BehaviorSubject(this.agentId);

  private types = {
    [AgentsService.FREE_MEMORY]: 0,
    [AgentsService.USAGE_MEMORY]: 1,
    [AgentsService.TOTAL_MEMORY]: 2,
  };

  private typesKey = Object.keys(this.types);

  options: { [key: string]: ChartOptions } = {
    diskChart: {
      animation: {
        duration: 300,
      },
      title: {
        display: true,
        text: this.translateService.instant('MODULES.STATS.LIVE.DISK_STAT'),
      },
      legend: {
        display: false,
      },
    },
    netChart: {
      animation: {
        duration: 300,
      },
      title: {
        display: true,
        text: this.translateService.instant('MODULES.STATS.LIVE.NET_STAT'),
      },
      legend: {
        display: false,
      },
      scales: {
        yAxes: [
          {
            stacked: true,
          },
        ],
      },
    },
    memoryChart: {
      animation: {
        duration: 300,
      },
      title: {
        display: true,
        text: this.translateService.instant('MODULES.STATS.LIVE.VIRTUAL_MEMORY'),
      },
      legend: {
        display: false,
      },
      tooltips: {
        callbacks: {
          label: (tooltipItem, data) => {
            const allData = data.datasets[tooltipItem.datasetIndex].data;
            const tooltipData = allData[tooltipItem.index] as number;
            let total = 0;
            for (const element of allData) {
              total += element as number;
            }
            return `${Math.round((tooltipData / total) * 100)} %`;
          },
          title: (tooltipItem, data) => {
            return data.labels[tooltipItem[0].index] as string;
          },
        },
      },
    },
    swapMemoryChart: {
      animation: {
        duration: 300,
      },
      title: {
        display: true,
        text: this.translateService.instant('MODULES.STATS.LIVE.SWAP_MEMORY'),
      },
      legend: {
        display: false,
      },
      tooltips: {
        callbacks: {
          label: (tooltipItem, data) => {
            const allData = data.datasets[tooltipItem.datasetIndex].data;
            const tooltipData = allData[tooltipItem.index] as number;
            let total = 0;

            for (const element of allData) {
              total += element as number;
            }
            return `${Math.round((tooltipData / total) * 100)} %`;
          },
          title: (tooltipItem, data) => {
            return data.labels[tooltipItem[0].index] as string;
          },
        },
      },
    },
    cpuChart: {
      animation: {
        duration: 300,
      },
      title: {
        display: true,
        text: this.translateService.instant('MODULES.STATS.LIVE.CPU_LOADING'),
      },
      legend: {
        display: false,
      },
      scales: {
        xAxes: [
          {
            ticks: {
              max: 1,
              min: 0,
            },
          },
        ],
        yAxes: [
          {
            stacked: true,
          },
        ],
      },
    },
  };

  private agentId_ = this._agentId$.pipe(filter((v) => !!v));

  agentInfo$ = this.agentId_.pipe(
    switchMap((id) => this.agentsService.getById(id)),
    share(),
    takeUntil(this.destroyed$),
  );

  liveStats$ = this.agentInfo$.pipe(
    switchMap((agentInfo) => timer(0, agentInfo.interval * 1000).pipe(map(() => agentInfo.id))),
    switchMap((agentId) => this.agentsService.getLiveStat(agentId)),
    map((stats) => {
      if (!stats) {
        return null;
      }
      return {
        timestamp: stats.time.seconds * 1000,
        netChart: (() => {
          const acc = Object.keys(stats.net_info.interfaces).reduce((prev, cur, index) => {
            if (!index) {
              return stats.net_info.interfaces[cur];
            }

            Object.keys(stats.net_info.interfaces[cur]).forEach((item) => {
              if (!prev[item]) {
                prev[item] = stats.net_info.interfaces[cur][item] || 0;
                return;
              }
              prev[item] += stats.net_info.interfaces[cur][item] || 0;
            });
            return prev;
          }, {});
          return Object.keys(acc).reduce(
            (prev, cur) => {
              prev.labels.push(cur);
              prev.datasets[0].data.push(acc[cur]);
              return prev;
            },
            {
              labels: [],
              datasets: [
                {
                  data: [],
                },
              ],
            },
          );
        })(),
        diskChart: (() => {
          return Object.keys(stats.disk_info.disks).reduce(
            (prev, cur) => {
              prev.labels.push(cur);
              prev.datasets[this.types[AgentsService.FREE_MEMORY]].data.push(
                stats.disk_info.disks[cur][AgentsService.FREE_MEMORY],
              );
              prev.datasets[this.types[AgentsService.USAGE_MEMORY]].data.push(
                stats.disk_info.disks[cur][AgentsService.USAGE_MEMORY],
              );
              prev.datasets[this.types[AgentsService.TOTAL_MEMORY]].data.push(
                stats.disk_info.disks[cur][AgentsService.TOTAL_MEMORY],
              );
              return prev;
            },
            {
              labels: [],
              datasets: this.typesKey.map((e) => ({
                data: [],
                label: e.toUpperCase(),
              })),
            },
          );
        })(),
        swapMemoryChart: (() => {
          const memory = stats.memory_info[AgentsService.SWAP_MEMORY];
          return Object.keys(memory).reduce(
            (prev, cur) => {
              if (cur === AgentsService.SHARED_MEMORY) {
                return prev;
              }
              if (cur === AgentsService.USED_PERSENT) {
                return prev;
              }
              if (cur === AgentsService.TOTAL_MEMORY) {
                return prev;
              }
              prev.labels.push(cur.toUpperCase());
              prev.datasets[0].data.push(memory[cur]);
              return prev;
            },
            {
              labels: [],
              datasets: [
                {
                  data: [],
                },
              ],
            },
          );
        })(),
        memoryChart: (() => {
          const memory = stats.memory_info[AgentsService.VIRTUAL_MEMORY];
          return Object.keys(memory).reduce(
            (prev, cur) => {
              if (cur === AgentsService.SHARED_MEMORY) {
                return prev;
              }
              if (cur === AgentsService.USED_PERSENT) {
                return prev;
              }
              if (cur === AgentsService.TOTAL_MEMORY) {
                return prev;
              }
              prev.labels.push(cur.toUpperCase());
              prev.datasets[0].data.push(memory[cur]);
              return prev;
            },
            {
              labels: [],
              datasets: [
                {
                  data: [],
                },
              ],
            },
          );
        })(),
        cpuChart: (() => {
          return stats.cpu_info.cpus.reduce(
            (prev, cur, index) => {
              prev.labels.push(
                `${this.translateService.instant('MODULES.STATS.CPU.CPU')} ${index + 1}`,
              );
              prev.datasets[0].data.push(cur.load / 100);
              return prev;
            },
            {
              labels: [],
              datasets: [
                {
                  data: [],
                },
              ],
            },
          );
        })(),
      };
    }),
    takeUntil(this.destroyed$),
  );

  constructor(private agentsService: AgentsService, private translateService: TranslateService) {}

  ngOnChanges(changes: SimpleChanges) {
    if ('agentId' in changes) {
      this._agentId$.next(changes.agentId.currentValue);
    }
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}
