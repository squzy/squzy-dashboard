import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IncidentListSortBy, IncidentStatus } from 'src/app/shared/enums/incident.type';
import { SortDirection } from 'src/app/shared/enums/sort.table';
import { Incident } from 'src/app/shared/interfaces/incident.interfaces';
import { setQueryParams, queryParam } from 'src/app/shared/utils/http.utils';

export interface IncidentPaginated {
  incidents: Array<Incident>;
  count: number;
}

@Injectable({
  providedIn: 'root',
})
export class IncidentService {
  constructor(private httpClient: HttpClient) {}

  getList(
    from: Date,
    to: Date,
    limit: number = 20,
    page: number = 0,
    sortBy: IncidentListSortBy = IncidentListSortBy.SORT_INCIDENT_LIST_UNSPECIFIED,
    direction: SortDirection = SortDirection.SORT_DIRECTION_UNSPECIFIED,
    status: IncidentStatus = IncidentStatus.INCIDENT_STATUS_UNSPECIFIED,
    ruleId?: string,
  ) {
    return this.httpClient.get<IncidentPaginated>(`/api/v1/incidents`, {
      params: setQueryParams(
        queryParam('dateFrom', from && from.toISOString()),
        queryParam('dateTo', to && to.toISOString()),
        queryParam('page', page),
        queryParam('limit', limit),
        queryParam('sort_by', sortBy),
        queryParam('sort_direction', direction),
        queryParam('ruleId', ruleId),
        queryParam('status', status),
      ),
    });
  }

  close(incidentId: string) {
    return this.httpClient.put<Incident>(`/api/v1/incidents/${incidentId}/close`, {});
  }

  study(incidentId: string) {
    return this.httpClient.put<Incident>(`/api/v1/incidents/${incidentId}/study`, {});
  }

  getById(incidentId: string) {
    return this.httpClient.get<Incident>(`/api/v1/incidents/${incidentId}`);
  }
}
