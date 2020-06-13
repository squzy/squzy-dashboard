import {
  Component,
  ChangeDetectionStrategy,
  ViewChild,
  OnDestroy,
  OnInit,
  AfterViewInit,
} from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Subject, combineLatest } from 'rxjs';
import {
  TransactionType,
  TransactionStatus,
  TransactionListSortBy,
  typeToString,
  statusToString,
  TransactionTypes,
} from 'src/app/shared/enums/transaction.type';
import { QueryParam, QueryParamBuilder } from '@ngqp/core';
import { tap, switchMap, catchError, takeUntil, map } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { ApplicationsService } from '../../services/applications.service';
import { SortDirection, angularSortDirectionMap } from 'src/app/shared/enums/sort.table';
import { TransactionListSource } from './datasources/list.datasource';
import { timeToDate, Time, diffInSec, SECOND } from 'src/app/shared/date/date';
import { roundNumber } from 'src/app/shared/numbers/numbers';
import { MatSelectChange } from '@angular/material/select';

@Component({
  selector: 'sqd-transactions-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransactionsListComponent implements AfterViewInit, OnInit, OnDestroy {
  static queryParam = {
    dateTo: 'dateTo',
    dateFrom: 'dateFrom',
    type: 'type',
    status: 'status',
    sortBy: 'sortBy',
    sortDirection: 'sortDirection',
    page: 'page',
    limit: 'limit',
    host: 'host',
    name: 'name',
    path: 'path',
    method: 'method',
  };

  private sortByMap = {
    Duration: TransactionListSortBy.SORT_TRANSACTION_LIST_UNSPECIFIED,
    StartTime: TransactionListSortBy.BY_TRANSACTION_START_TIME,
    EndTime: TransactionListSortBy.BY_TRANSACTION_END_TIME,
  };

  displayedColumns: string[] = [
    'Id',
    'StartTime',
    'EndTime',
    'Name',
    'Type',
    'Status',
    'Duration',
    'Host',
    'Path',
    'Method',
  ];

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  private destroyed$ = new Subject();

  currentApplicationId$ = this.route.parent.params.pipe(
    map((p) => p.id as string),
    takeUntil(this.destroyed$),
  );

  pageSizes = [5, 10, 20, 100];

  types = TransactionTypes;

  // private autoRefresh_$ = new BehaviorSubject(false);

  // private readonly refresh$ = new BehaviorSubject(null);

  queryFilterGroup = this.qpb.group({
    [TransactionsListComponent.queryParam.dateFrom]: this.qpb.param(
      TransactionsListComponent.queryParam.dateFrom,
      {
        serialize: (value: Date) => (value && value.toISOString()) || null,
        deserialize: (value) => (value ? new Date(value) : null),
      },
    ),
    [TransactionsListComponent.queryParam.dateTo]: this.qpb.param(
      TransactionsListComponent.queryParam.dateTo,
      {
        serialize: (value: Date) => (value && value.toISOString()) || null,
        deserialize: (value) => (value ? new Date(value) : null),
      },
    ),
    [TransactionsListComponent.queryParam.type]: this.qpb.numberParam(
      TransactionsListComponent.queryParam.type,
      {
        emptyOn: TransactionType.TRANSACTION_TYPE_UNSPECIFIED,
        serialize: (value: TransactionType) => `${value}`,
        deserialize: (value) => +value,
      },
    ),
    [TransactionsListComponent.queryParam.status]: this.qpb.numberParam(
      TransactionsListComponent.queryParam.status,
      {
        emptyOn: TransactionStatus.Unspecified,
        serialize: (value: TransactionStatus) => `${value}`,
        deserialize: (value) => +value,
      },
    ),
    [TransactionsListComponent.queryParam.sortBy]: this.qpb.numberParam(
      TransactionsListComponent.queryParam.sortBy,
      {
        emptyOn: TransactionListSortBy.SORT_TRANSACTION_LIST_UNSPECIFIED,
        serialize: (value: TransactionListSortBy) => `${value}`,
        deserialize: (value) => +value,
      },
    ),
    [TransactionsListComponent.queryParam.sortDirection]: this.qpb.numberParam(
      TransactionsListComponent.queryParam.sortDirection,
      {
        emptyOn: SortDirection.SORT_DIRECTION_UNSPECIFIED,
        serialize: (value: SortDirection) => `${value}`,
        deserialize: (value) => +value,
      },
    ),
    [TransactionsListComponent.queryParam.page]: this.qpb.numberParam(
      TransactionsListComponent.queryParam.page,
      {
        emptyOn: 0,
        serialize: (value: number) => `${value}`,
        deserialize: (value) => +value,
      },
    ),
    [TransactionsListComponent.queryParam.limit]: this.qpb.numberParam(
      TransactionsListComponent.queryParam.limit,
      {
        emptyOn: this.pageSizes[0],
        serialize: (value: number) => `${value}`,
        deserialize: (value) => +value,
      },
    ),

    [TransactionsListComponent.queryParam.host]: this.qpb.stringParam(
      TransactionsListComponent.queryParam.host,
      {
        emptyOn: '',
        serialize: (value: string) => `${value}`,
        deserialize: (value) => value,
        debounceTime: 300,
      },
    ),

    [TransactionsListComponent.queryParam.path]: this.qpb.stringParam(
      TransactionsListComponent.queryParam.path,
      {
        emptyOn: '',
        serialize: (value: string) => `${value}`,
        deserialize: (value) => value,
        debounceTime: 300,
      },
    ),

    [TransactionsListComponent.queryParam.name]: this.qpb.stringParam(
      TransactionsListComponent.queryParam.name,
      {
        emptyOn: '',
        serialize: (value: string) => `${value}`,
        deserialize: (value) => value,
        debounceTime: 300,
      },
    ),

    [TransactionsListComponent.queryParam.method]: this.qpb.stringParam(
      TransactionsListComponent.queryParam.method,
      {
        emptyOn: '',
        serialize: (value: string) => `${value}`,
        deserialize: (value) => value,
        debounceTime: 300,
      },
    ),
  });

  get type(): QueryParam<number> {
    return this.queryFilterGroup.get(TransactionsListComponent.queryParam.type) as QueryParam<
      number
    >;
  }

  get status(): QueryParam<number> {
    return this.queryFilterGroup.get(TransactionsListComponent.queryParam.status) as QueryParam<
      number
    >;
  }

  statuses = [
    TransactionStatus.Unspecified,
    TransactionStatus.Failed,
    TransactionStatus.Successfull,
  ];

  transactionList$ = combineLatest(
    this.currentApplicationId$,
    this.queryFilterGroup.valueChanges,
  ).pipe(takeUntil(this.destroyed$));

  dataSource = new TransactionListSource(this.applicationService);

  constructor(
    private route: ActivatedRoute,
    private applicationService: ApplicationsService,
    private qpb: QueryParamBuilder,
  ) {}

  ngOnInit() {
    this.sort.sortChange.pipe(takeUntil(this.destroyed$)).subscribe((e) => {
      this.queryFilterGroup.patchValue({
        [TransactionsListComponent.queryParam.sortDirection]: angularSortDirectionMap[e.direction],
        [TransactionsListComponent.queryParam.sortBy]:
          this.sortByMap[e.active] || TransactionListSortBy.SORT_TRANSACTION_LIST_UNSPECIFIED,
      });
    });

    this.paginator.page.pipe(takeUntil(this.destroyed$)).subscribe((e) => {
      this.queryFilterGroup.patchValue({
        [TransactionsListComponent.queryParam.limit]: e.pageSize,
        [TransactionsListComponent.queryParam.page]: e.pageIndex,
      });
    });

    this.transactionList$
      .pipe(
        switchMap(([id, formValue]) =>
          this.dataSource.load(
            id,
            formValue[TransactionsListComponent.queryParam.dateFrom],
            formValue[TransactionsListComponent.queryParam.dateTo],
            formValue[TransactionsListComponent.queryParam.page],
            formValue[TransactionsListComponent.queryParam.limit] || this.pageSizes[0],
            formValue[TransactionsListComponent.queryParam.sortBy],
            formValue[TransactionsListComponent.queryParam.sortDirection],
            formValue[TransactionsListComponent.queryParam.status],
            formValue[TransactionsListComponent.queryParam.type],
            {
              name: formValue[TransactionsListComponent.queryParam.name],
              host: formValue[TransactionsListComponent.queryParam.host],
              path: formValue[TransactionsListComponent.queryParam.path],
              method: formValue[TransactionsListComponent.queryParam.method],
            },
          ),
        ),
      )
      .subscribe();

    this.dataSource.count$.pipe(takeUntil(this.destroyed$)).subscribe((value) => {
      this.paginator.length = value;
    });
  }

  ngAfterViewInit() {
    this.queryFilterGroup.patchValue({});
  }

  toDate(time: Time) {
    return timeToDate(time);
  }

  toType(type: TransactionType) {
    return typeToString(type);
  }

  toStatus(status: TransactionStatus) {
    return statusToString(status);
  }

  getDuration(a: Time, b: Time) {
    return roundNumber(diffInSec(a, b) / SECOND, 3);
  }

  onTypeChange(event: MatSelectChange) {
    this.type.setValue(event.value);
  }

  onStatusChange(event: MatSelectChange) {
    this.status.setValue(event.value);
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}
