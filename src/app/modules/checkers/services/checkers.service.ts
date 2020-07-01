import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Time } from 'src/app/shared/date/date';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import {
  Types,
  SelectorTypes,
  SchedulerStatus,
  SchedulerResponseCode,
  SortSchedulerList,
} from 'src/app/shared/enums/schedulers.type';
import { SortDirection } from 'src/app/shared/enums/sort.table';
import { setQueryParams, queryParam } from 'src/app/shared/utils/http.utils';

export interface SchedulerUptime {
  uptime: number;
  latency: number;
}

export interface SchedulerUptimeWithDate extends SchedulerUptime {
  from: Date;
  to: Date;
}

export interface Scheduler {
  id: string;
  name?: string;
  type: Types;
  status: SchedulerStatus;
  interval: number;
  timeout?: number;
  Config: {
    Http?: {
      method: string;
      url: string;
      statusCode: number;
      headers?: { [key: string]: string };
    };
    Tcp?: {
      host: string;
      port: number;
    };
    Grpc?: {
      service?: string;
      host: string;
      port: number;
    };
    HttpValue?: {
      method: string;
      url: string;
      headers?: { [key: string]: string };
      selectors: Array<{
        path: string;
        type: SelectorTypes;
      }>;
    };
  };
}

export interface HistoryItem {
  code: SchedulerResponseCode;
  type: Types;
  error?: {
    message: string;
  };
  meta: {
    start_time: Time;
    end_time: Time;
  };
}

export interface HistoryPaginated {
  count: number;
  snapshots: Array<HistoryItem>;
}

@Injectable({
  providedIn: 'root',
})
export class CheckersService {
  constructor(private httpClient: HttpClient) {}

  getList() {
    return this.httpClient
      .get<Array<Scheduler>>('/api/v1/schedulers')
      .pipe(map((list) => (list || []).filter((item) => item.status !== SchedulerStatus.REMOVED)));
  }

  addChecker(req) {
    return this.httpClient.post<{ id: string }>(`/api/v1/schedulers`, req);
  }

  getById(id: string): Observable<Scheduler> {
    return this.httpClient.get<Scheduler>(`/api/v1/schedulers/${id}`);
  }

  runById(id: string) {
    return this.httpClient.put(`/api/v1/schedulers/${id}/run`, null);
  }

  stopById(id: string) {
    return this.httpClient.put(`/api/v1/schedulers/${id}/stop`, null);
  }

  removeById(id: string) {
    return this.httpClient.delete(`/api/v1/schedulers/${id}`);
  }

  getUptimeById(id: string, dateFrom: Date, dateTo: Date): Observable<SchedulerUptimeWithDate> {
    return this.httpClient
      .get<SchedulerUptime>(`/api/v1/schedulers/${id}/uptime`, {
        params: setQueryParams(
          queryParam('dateFrom', dateFrom && dateFrom.toISOString()),
          queryParam('dateTo', dateTo && dateTo.toISOString()),
        ),
      })
      .pipe(
        map((value) => {
          return {
            latency: value.latency,
            uptime: value.uptime,
            from: dateFrom,
            to: dateTo,
          };
        }),
      );
  }

  getHistory(
    id: string,
    dateFrom: Date,
    dateTo: Date,
    limit: number = 20,
    page: number = 0,
    sortBy: SortSchedulerList = SortSchedulerList.SORT_SCHEDULER_LIST_UNSPECIFIED,
    direction: SortDirection = SortDirection.SORT_DIRECTION_UNSPECIFIED,
    status: SchedulerResponseCode = SchedulerResponseCode.SCHEDULER_CODE_UNSPECIFIED,
  ) {
    const params = setQueryParams(
      queryParam('sort_by', sortBy),
      queryParam('sort_direction', direction),
      queryParam('status', status),
      queryParam('page', page),
      queryParam('limit', limit),
      queryParam('dateFrom', dateFrom && dateFrom.toISOString()),
      queryParam('dateTo', dateTo && dateTo.toISOString()),
    );
    return this.httpClient.get<HistoryPaginated>(`/api/v1/schedulers/${id}/history`, {
      params,
    });
  }
}
