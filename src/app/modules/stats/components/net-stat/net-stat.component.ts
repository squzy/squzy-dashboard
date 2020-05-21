import { Component, Input, SimpleChanges, OnChanges, ChangeDetectionStrategy } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { filter, switchMap, map } from 'rxjs/operators';
import { ChartOptions } from 'chart.js';
import { AgentsService } from 'src/app/modules/agents/services/agents.service';
import { timeToDate } from 'src/app/shared/date/date';

@Component({
  selector: 'sqd-net-stat',
  templateUrl: './net-stat.component.html',
  styleUrls: ['./net-stat.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NetStatComponent implements OnChanges {
  @Input() agentId: string;

  private _agentId$ = new BehaviorSubject(this.agentId);

  private getNetStream$ = this._agentId$.pipe(
    filter((v) => !!v),
    switchMap((agentId) => this.agentsService.getNetStats(agentId)),
    filter((v) => !!v),
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

  netCharts$ = this.getNetStream$.pipe(
    map((stats) => {
      const labels = [];
      const datasets = {};
      const types = new Set();
      stats.forEach((item, index) => {
        labels.push(timeToDate(item.time));
        Object.keys(item.net_info.interfaces).forEach((iface, subIndex) => {
          if (!index) {
            datasets[iface] = Object.keys(item.net_info.interfaces[iface]).reduce((prev, cur) => {
              types.add(cur);
              prev[cur] = [item.net_info.interfaces[iface][cur] || 0];
              return prev;
            }, {});
            return;
          }
          Object.keys(item.net_info.interfaces[iface]).forEach((key) => {
            datasets[iface][key].push(item.net_info.interfaces[iface][key] || 0);
          });
        });
      });
      return Object.keys(datasets).map((iface) => ({
        options: {
          ...this._defaultOptions,
          title: {
            display: true,
            text: `Interface: ${iface}`,
          },
        },
        labels,
        datasets: Array.from(types).map((type) => ({
          data: datasets[iface][type] || [],
          label: type,
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
