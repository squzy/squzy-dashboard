import { Component, Input, SimpleChanges, OnChanges, ChangeDetectionStrategy } from '@angular/core';
import { BehaviorSubject, timer } from 'rxjs';
import { filter, switchMap, map, tap } from 'rxjs/operators';
import { ChartOptions } from 'chart.js';
import { AgentsService } from 'src/app/modules/agents/services/agents.service';
import { AgentStatus } from 'src/app/shared/enums/agent.type';

@Component({
  selector: 'sqd-live-stat',
  templateUrl: './live-stat.component.html',
  styleUrls: ['./live-stat.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LiveStatComponent implements OnChanges {
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
        text: 'Disks Statistic',
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
        text: 'Net Stats',
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
        text: 'Virtual Memory stats',
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
        text: 'Swap Memory stats',
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
        text: 'CPU Loading',
      },
      legend: {
        display: false,
      },
      scales: {
        xAxes: [
          {
            ticks: {
              max: 1,
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

  agentInfo$ = this.agentId_.pipe(switchMap((id) => this.agentsService.getById(id)));

  liveStats$ = this.agentId_.pipe(
    switchMap((agentId) => timer(0, 10000).pipe(map(() => agentId))),
    switchMap((agentId) => this.agentsService.getLiveStat(agentId)),
    filter((stats) => !!stats),
    map((stats) => {
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
              prev.labels.push(`CPU ${index + 1}`);
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
  );

  constructor(private agentsService: AgentsService) {}

  ngOnChanges(changes: SimpleChanges) {
    if ('agentId' in changes) {
      this._agentId$.next(changes.agentId.currentValue);
    }
  }

  statusToString(status: AgentStatus) {
    return this.agentsService.statusToString(status);
  }
}
