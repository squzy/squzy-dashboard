import { Injectable } from '@angular/core';
import { of, Observable } from 'rxjs';
import { MINUTE, SECOND } from 'src/app/shared/date/date';
import { HttpClient } from '@angular/common/http';

export enum Types {
  Tcp = 0,
  Grpc = 1,
  Http = 2,
  SiteMap = 3,
  HttpJsonValue = 4,
}

export enum SchedulerStatus {
  Runned = 0,
  Stopped = 1,
  Removed = 3,
}

export enum SchedulerResponseCode {
  OK = 0,
  Error = 1,
}

export enum SelectorTypes {
  String = 0,
  Bool = 1,
  Number = 2,
  Time = 3,
  Any = 4,
  Raw = 5,
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

@Injectable({
  providedIn: 'root',
})
export class CheckersService {
  constructor(private httpClient: HttpClient) {}

  getList() {
    return this.httpClient.get<Array<Scheduler>>('/api/v1/schedulers');
  }

  getHistory(id: string, dateFrom: string, dateTo: string) {
    return of(
      Array(20)
        .fill(0)
        .map(() => checkerMock()),
    );
  }

  getById(id: string) {
    return this.httpClient.get<Scheduler>(`/api/v1/schedulers/${id}`);
  }

  toSchedulerResponseStatus(status) {
    return SchedulerResponseCode[status || SchedulerResponseCode.OK];
  }

  toSchedulerStatus(status) {
    return SchedulerStatus[status || SchedulerStatus.Runned];
  }

  toType(type) {
    return Types[type || Types.Tcp];
  }
}
