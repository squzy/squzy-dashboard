import { Injectable } from '@angular/core';
import { of } from 'rxjs';

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
  status: StatusCode.OK,
  lastCheck: Date.now(),
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

  constructor() {}
}
