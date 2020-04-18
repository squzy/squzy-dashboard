import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, filter, switchMap, map } from 'rxjs/operators';
import { AgentsService } from 'src/app/shared/services/agents.service';
import { ChartDataSets, ChartOptions } from 'chart.js';

@Component({
  selector: 'sqd-cpu-stats',
  templateUrl: './cpu-stats.component.html',
  styleUrls: ['./cpu-stats.component.scss'],
})
export class CpuStatsComponent implements OnChanges {
  @Input() agentId: string;

  private _agentId$ = new BehaviorSubject(this.agentId);

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
            source: 'auto',
            beginAtZero: true,
          },
          display: true,
        },
      ],
    },
  };

  data$ = this._agentId$.pipe(
    filter((v) => !!v),
    switchMap((agentId) => this.agentsService.getCpuStats(agentId)),
    map((history) => {
      const length = history[0].stats.length;

      const datasets = Array(length)
        .fill(0)
        .map((_, index) => []);

      const labels = [];
      history.forEach((item) => {
        labels.push(item.timestamp);
        item.stats.forEach((cpu, index) => {
          datasets[index].push(cpu);
        });
      });

      return datasets.map((item, index) => ({
        labels,
        dataset: [
          {
            data: item,
            label: `CPU ${index}`,
            lineTension: 0,
          },
        ],
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
