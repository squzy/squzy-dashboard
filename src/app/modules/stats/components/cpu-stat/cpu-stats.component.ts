import { Component, Input, OnChanges, SimpleChanges, ChangeDetectionStrategy } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { filter, switchMap, map } from 'rxjs/operators';
import { ChartOptions } from 'chart.js';
import { AgentsService } from 'src/app/modules/agents/services/agents.service';

@Component({
  selector: 'sqd-cpu-stats',
  templateUrl: './cpu-stats.component.html',
  styleUrls: ['./cpu-stats.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
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

  data$ = this._agentId$.pipe(
    filter((v) => !!v),
    switchMap((agentId) => this.agentsService.getCpuStats(agentId)),
    map((history) => {
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
            label: `CPU ${index + 1}`,
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
