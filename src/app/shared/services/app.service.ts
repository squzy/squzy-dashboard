import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AppService {
  constructor(private httpClient: HttpClient) {}

  getVersion() {
    return this.httpClient.get('/app/version').pipe(map((v: any) => v.version));
  }
}
