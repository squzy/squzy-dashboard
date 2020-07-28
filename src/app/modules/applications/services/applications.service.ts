import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApplicationStatus } from 'src/app/shared/enums/application.type';
import {
  TransactionGroup,
  TransactionStatus,
  TransactionType,
  TransactionListSortBy,
} from 'src/app/shared/enums/transaction.type';
import { map } from 'rxjs/operators';
import { SortDirection } from 'src/app/shared/enums/sort.table';
import { setQueryParams, queryParam } from 'src/app/shared/utils/http.utils';
import { Transaction } from 'src/app/shared/interfaces/transaction.interfaces';

export interface TransactionListFilters {
  host?: string;
  name?: string;
  path?: string;
  method?: string;
}

export interface TransactionPaginated {
  count: number;
  transactions: Array<Transaction>;
}

export interface Application {
  id: string;
  name: string;
  host_name?: string;
  status: ApplicationStatus;
}

export interface ITransactionGroup {
  count: number;
  average_time: number;
  success_ratio: number;
  min_time: number;
  max_time: number;
  throughput: number;
}

export interface TransactionGroupResponse {
  transactions: { [key: string]: ITransactionGroup };
}

@Injectable()
export class ApplicationsService {
  constructor(private httpClient: HttpClient) {}

  getById(id: string) {
    return this.httpClient.get<Application>(`/api/v1/applications/${id}`);
  }

  getTransactionsList(
    applicationId: string,
    from: Date,
    to: Date,
    page: number = 0,
    limit: number = 20,
    sortBy: TransactionListSortBy = TransactionListSortBy.BY_TRANSACTION_START_TIME,
    soryDirection: SortDirection = SortDirection.SORT_DIRECTION_UNSPECIFIED,
    status: TransactionStatus = TransactionStatus.TRANSACTION_CODE_UNSPECIFIED,
    type: TransactionType = TransactionType.TRANSACTION_TYPE_UNSPECIFIED,
    filter: TransactionListFilters = {},
  ) {
    return this.httpClient.get<TransactionPaginated>(
      `/api/v1/applications/${applicationId}/transactions/list`,
      {
        params: setQueryParams(
          queryParam('sort_by', sortBy),
          queryParam('sort_direction', soryDirection),
          queryParam('transaction_type', type),
          queryParam('transaction_status', status),
          queryParam('host', filter.host),
          queryParam('name', filter.name),
          queryParam('path', filter.path),
          queryParam('method', filter.method),
          queryParam('dateFrom', from && from.toISOString()),
          queryParam('dateTo', to && to.toISOString()),
          queryParam('page', page),
          queryParam('limit', limit),
        ),
      },
    );
  }

  getTrasnsactionsGroup(
    applicationId: string,
    from: Date,
    to: Date,
    groupBy: TransactionGroup = TransactionGroup.GROUP_TRANSACTION_UNSPECIFIED,
    status: TransactionStatus = TransactionStatus.TRANSACTION_CODE_UNSPECIFIED,
    type: TransactionType = TransactionType.TRANSACTION_TYPE_UNSPECIFIED,
  ) {
    return this.httpClient
      .get<TransactionGroupResponse>(`/api/v1/applications/${applicationId}/transactions/group`, {
        params: setQueryParams(
          queryParam('group_by', groupBy),
          queryParam('transaction_type', type),
          queryParam('transaction_status', status),
          queryParam('dateFrom', from && from.toISOString()),
          queryParam('dateTo', to && to.toISOString()),
        ),
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
    return this.httpClient.delete<Application>(`/api/v1/applications/${id}/archived`, null);
  }
}
