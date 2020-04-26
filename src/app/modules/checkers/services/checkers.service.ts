import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { MINUTE, SECOND } from 'src/app/shared/date/date';

export enum Types {
  Tcp = 0,
  Grpc = 1,
  Http = 2,
  SiteMap = 3,
  HttpJsonValue = 4,
}

export enum StatusCode {
  OK = 0,
  Error = 1,
}

const checkerMock = () => ({
  id: Math.random().toString(36).substring(2, 10),
  type: Types.Http,
  status: Math.random() * 100 > 30 ? StatusCode.OK : StatusCode.Error,
  startTime: Date.now() - SECOND * Math.round(Math.random() * 10),
  endTime: Date.now(),
  lastError: Math.random() * 100 > 10 ? null : Date.now(),
});

const checkInfoMock = (id) => ({
  id,
  type: Types.Http,
  name: Math.random().toString(36).substring(2, 10),
});

@Injectable({
  providedIn: 'root',
})
export class CheckersService {
  getList(page: number = 0, limit: number = 10) {
    return of({
      list: Array(limit)
        .fill(0)
        .map(() => checkerMock()),
      count: limit + Math.round(Math.random() * limit * 5 + 1),
    });
  }

  getHistory(id: string, dateFrom: string, dateTo: string) {
    return of(
      Array(20)
        .fill(0)
        .map(() => checkerMock()),
    );
  }

  getCheckById(id: string) {
    return of({
      ...checkInfoMock(id),
      interval: 10,
      timeout: 10,
    });
  }

  toStatus(status) {
    return StatusCode[status];
  }

  toType(type) {
    return Types[type];
  }

  constructor() {}
}
