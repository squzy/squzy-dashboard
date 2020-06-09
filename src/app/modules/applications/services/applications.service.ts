import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ApplicationStatus } from 'src/app/shared/enums/application.type';
import {
  TransactionGroup,
  TransactionStatus,
  TransactionType,
} from 'src/app/shared/enums/transaction.type';
import { map } from 'rxjs/operators';

export interface Application {
  id: string;
  name: string;
  host_name?: string;
  status: ApplicationStatus;
}

export interface ITransactionGroup {
  count: number;
  average_time: number;
}

export interface TransactionGroupResponse {
  transactions: { [key: string]: ITransactionGroup };
}

@Injectable({
  providedIn: 'root',
})
export class ApplicationsService {
  constructor(private httpClient: HttpClient) {}

  getById(id: string) {
    return this.httpClient.get<Application>(`/api/v1/applications/${id}`);
  }

  getTrasnsactionsGroup(
    id: string,
    from: Date,
    to: Date,
    groupBy: TransactionGroup = TransactionGroup.Unspecified,
    status: TransactionStatus = TransactionStatus.Unspecified,
    type: TransactionType = TransactionType.Unspecified,
  ) {
    let params = new HttpParams()
      .set('group_by', `${groupBy}`)
      .set('transaction_type', `${type}`)
      .set('transaction_status', `${status}`);
    if (from) {
      params = params.set('dateFrom', from.toISOString() || '');
    }
    if (to) {
      params = params.set('dateTo', (to && to.toISOString()) || '');
    }
    return this.httpClient
      .get<TransactionGroupResponse>(`/api/v1/applications/${id}/transactions/group`, {
        params,
      })
      .pipe(map((res) => res.transactions || {}));
  }

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
