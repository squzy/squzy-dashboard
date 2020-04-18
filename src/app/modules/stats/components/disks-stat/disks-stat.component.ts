import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AgentsService } from 'src/app/shared/services/agents.service';
import { filter, switchMap, map } from 'rxjs/operators';
import { ChartOptions } from 'chart.js';

@Component({
  selector: 'sqd-disks-stat',
  templateUrl: './disks-stat.component.html',
  styleUrls: ['./disks-stat.component.scss'],
})
export class DisksStatComponent implements OnChanges {
  @Input() agentId: string;

  private _agentId$ = new BehaviorSubject(this.agentId);

  private getDiskStream$ = this._agentId$.pipe(
    filter((v) => !!v),
    switchMap((agentId) => this.agentsService.getDisksStats(agentId)),
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

          ticks: {
            source: 'data',
          },
          display: true,
        },
      ],
    },
  };

  types = [AgentsService.FREE_MEMORY, AgentsService.USAGE_MEMORY, AgentsService.TOTAL_MEMORY];

  disksCharts$ = this.getDiskStream$.pipe(
    map((stats) => {
      const labels = [];
      const datasets = {};
      stats.forEach((item) => {
        labels.push(item.timestamp);
        Object.keys(item.disksStats).forEach((diskStat) => {
          if (!datasets[diskStat]) {
            datasets[diskStat] = {
              [AgentsService.FREE_MEMORY]: [item.disksStats[diskStat].free],
              [AgentsService.USAGE_MEMORY]: [item.disksStats[diskStat].used],
              [AgentsService.TOTAL_MEMORY]: [item.disksStats[diskStat].total],
            };
            return;
          }
          datasets[diskStat][AgentsService.FREE_MEMORY].push(item.disksStats[diskStat].free);
          datasets[diskStat][AgentsService.USAGE_MEMORY].push(item.disksStats[diskStat].used);
          datasets[diskStat][AgentsService.TOTAL_MEMORY].push(item.disksStats[diskStat].total);
        });
      });

      return Object.keys(datasets).map((disk) => ({
        options: {
          ...this._defaultOptions,
          title: {
            display: true,
            text: `Path: ${disk}`,
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
  );

  constructor(private agentsService: AgentsService) {}

  ngOnChanges(changes: SimpleChanges) {
    if ('agentId' in changes) {
      this._agentId$.next(changes.agentId.currentValue);
    }
  }
}
