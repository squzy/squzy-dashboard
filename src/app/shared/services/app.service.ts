import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable()
export class AppService {
  constructor(private httpClient: HttpClient) {}

  getVersion() {
    return this.httpClient.get<string>('/app/version').pipe(
      map((v: any) => v.version),
      catchError((err) => of('local')),
    );
  }
}
