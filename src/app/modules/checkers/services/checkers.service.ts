import { Injectable } from '@angular/core';
import { of, Observable } from 'rxjs';
import { MINUTE, SECOND } from 'src/app/shared/date/date';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Types, SelectorTypes } from 'src/app/shared/enums/schedulers.type';

export enum SchedulerStatus {
  Runned = 1,
  Stopped = 2,
  Removed = 3,
}

export enum SchedulerResponseCode {
  OK = 1,
  Error = 2,
}

const checkerMock = () => ({
  id: Math.random().toString(36).substring(2, 10),
  type: Types.Http,
  status: Math.random() * 100 > 30 ? SchedulerResponseCode.OK : SchedulerResponseCode.Error,
  startTime: Date.now() - SECOND * Math.round(Math.random() * 10),
  endTime: Date.now(),
  lastError: Math.random() * 100 > 10 ? null : Date.now(),
});

export interface Scheduler {
  id: string;
  type: Types;
  status: SchedulerStatus;
  interval: number;
  timeout: number;
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
    start_time: {
      seconds: number;
      nanos: number;
    };
    end_time: {
      seconds: number;
      nanos: number;
    };
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
      .pipe(map((list) => (list || []).filter((item) => item.status !== SchedulerStatus.Removed)));
  }

  addChecker(req) {
    return this.httpClient.post<{ id: string }>(`/api/v1/schedulers`, req);
  }

  getById(id: string) {
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

  getHistory(id: string, dateFrom: Date, dateTo: Date) {
    return this.httpClient.get<HistoryPaginated>(
      `/api/v1/schedulers/${id}/history?dateFrom=${dateFrom.toISOString()}&dateTo=${dateTo.toISOString()}`,
    );
  }

  toSchedulerResponseStatus(status) {
    return SchedulerResponseCode[status];
  }

  toSchedulerStatus(status) {
    return SchedulerStatus[status];
  }

  toType(type) {
    return Types[type];
  }
}
