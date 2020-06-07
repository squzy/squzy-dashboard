import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApplicationStatus } from 'src/app/shared/enums/application.type';

export interface Application {
  id: string;
  name: string;
  host_name?: string;
  status: ApplicationStatus;
}

@Injectable({
  providedIn: 'root',
})
export class ApplicationsService {
  constructor(private httpClient: HttpClient) {}

  getList() {
    return this.httpClient.get<Array<Application>>(`/api/v1/applications`);
  }

  enabled(id: string) {
    return this.httpClient.put<Application>(`/api/v1/applications/${id}/enabled`, null);
  }

  disabled(id: string) {
    return this.httpClient.put<Application>(`/api/v1/applications/${id}/disabled`, null);
  }

  archived(id: string) {
    return this.httpClient.put<Application>(`/api/v1/applications/${id}/archived`, null);
  }
}
