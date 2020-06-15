import {
  Component,
  Input,
  SimpleChanges,
  OnChanges,
  ChangeDetectionStrategy,
  OnDestroy,
} from '@angular/core';
import { BehaviorSubject, Subject, Observable, combineLatest } from 'rxjs';
import { filter, switchMap, map, takeUntil, tap } from 'rxjs/operators';
import { ChartOptions } from 'chart.js';
import { AgentsService } from 'src/app/modules/agents/services/agents.service';
import { timeToDate, FormRangeValue } from 'src/app/shared/date/date';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'sqd-net-stat',
  templateUrl: './net-stat.component.html',
  styleUrls: ['./net-stat.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NetStatComponent implements OnChanges, OnDestroy {
  private destroyed$ = new Subject();

  @Input() agentId: string;

  private _agentId$ = new BehaviorSubject(null);

  @Input() range: FormRangeValue;

  private range$ = new BehaviorSubject<FormRangeValue>(null);

  private getNetStream$ = combineLatest(
    this._agentId$.pipe(filter((v) => !!v)),
    this.range$.pipe(filter((v) => !!v)),
  ).pipe(
    switchMap(([agentId, range]) =>
      this.agentsService.getNetStats(agentId, range.dateFrom, range.dateTo),
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
    },
  };

  netCharts$ = this.getNetStream$.pipe(
    map((stats) => {
      if (!stats) {
        return [];
      }
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
            text: `${this.translateService.instant('MODULES.STATS.NET.INTERFACE')}: ${iface}`,
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
