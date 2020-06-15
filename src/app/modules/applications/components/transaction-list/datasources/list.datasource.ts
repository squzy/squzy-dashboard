import { DataSource } from '@angular/cdk/table';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { CollectionViewer } from '@angular/cdk/collections';
import { SortDirection } from 'src/app/shared/enums/sort.table';
import { finalize, tap, catchError } from 'rxjs/operators';
import {
  ApplicationsService,
  TransactionListFilters,
} from '../../../services/applications.service';
import {
  TransactionListSortBy,
  TransactionStatus,
  TransactionType,
} from 'src/app/shared/enums/transaction.type';
import { Transaction } from 'src/app/shared/interfaces/transaction.interfaces';

export class TransactionListSource implements DataSource<Transaction> {
  private transactionsList$ = new BehaviorSubject<Transaction[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private countElement$ = new BehaviorSubject<number>(0);

  public loading$ = this.loadingSubject.asObservable();

  public count$ = this.countElement$.asObservable();

  constructor(private applicationsService: ApplicationsService) {}

  connect(collectionViewer: CollectionViewer): Observable<Transaction[]> {
    return this.transactionsList$.asObservable();
  }

  disconnect(collectionViewer: CollectionViewer): void {
    this.transactionsList$.complete();
    this.loadingSubject.complete();
    this.countElement$.complete();
  }

  load(
    applicationId: string,
    from: Date,
    to: Date,
    page: number = 0,
    limit: number = 20,
    sortBy: TransactionListSortBy = TransactionListSortBy.SORT_TRANSACTION_LIST_UNSPECIFIED,
    soryDirection: SortDirection = SortDirection.SORT_DIRECTION_UNSPECIFIED,
    status: TransactionStatus = TransactionStatus.TRANSACTION_CODE_UNSPECIFIED,
    type: TransactionType = TransactionType.TRANSACTION_TYPE_UNSPECIFIED,
    filter: TransactionListFilters = {},
  ) {
    this.loadingSubject.next(true);
    return this.applicationsService
      .getTransactionsList(
        applicationId,
        from,
        to,
        page,
        limit,
        sortBy,
        soryDirection,
        status,
        type,
        filter,
      )
      .pipe(
        catchError((err) => {
          return of({
            count: 0,
            transactions: [],
          });
        }),
        finalize(() => this.loadingSubject.next(false)),
        tap((data) => {
          this.countElement$.next(data.count);
          this.transactionsList$.next(data.transactions);
        }),
      );
  }
}
