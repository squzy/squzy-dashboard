import {
  Component,
  ChangeDetectionStrategy,
  ViewChild,
  OnDestroy,
  OnInit,
  AfterViewInit,
} from '@angular/core';
import { map, switchMap, tap, takeUntil, catchError, share } from 'rxjs/operators';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { ApplicationsService, ITransactionGroup } from '../../services/applications.service';
import { minusMinute } from 'src/app/shared/date/date';
import {
  TransactionGroup,
  groupTypesToString,
  TransactionType,
  typeToString,
  TransactionStatus,
  statusToString,
  TransactionTypes,
} from 'src/app/shared/enums/transaction.type';
import { combineLatest, Subject, of } from 'rxjs';
import { MatDrawer } from '@angular/material/sidenav';
import { QueryParam, QueryParamBuilder } from '@ngqp/core';
import { MatSelectChange } from '@angular/material/select';
import { TransactionsListComponent } from '../transaction-list/list.component';
import { getRoundedPercent, roundNumber } from 'src/app/shared/numbers/numbers';

function getFilterValue() {
  const now = new Date(Date.now());
  return {
    dateFrom: minusMinute(+now, 10),
    dateTo: now,
  };
}

@Component({
  selector: 'sqd-transactions-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransactionsOverviewComponent implements AfterViewInit, OnDestroy {
  private destroyed$ = new Subject();

  private currentAppId: string;

  @ViewChild(MatDrawer, { static: true }) drawer: MatDrawer;

  currentApplicationId$ = this.route.parent.params.pipe(
    map((p) => p.id as string),
    tap((id) => (this.currentAppId = id)),
    takeUntil(this.destroyed$),
  );

  initValue = getFilterValue();

  groupByGroups = [
    TransactionGroup.Unspecified,
    TransactionGroup.Type,
    TransactionGroup.Method,
    TransactionGroup.Name,
    TransactionGroup.Host,
    TransactionGroup.Path,
  ];

  queryFilterGroup = this.qpb.group({
    from: this.qpb.param('dateFrom', {
      serialize: (value: Date) => (value && value.toISOString()) || null,
      deserialize: (value) => (value ? new Date(value) : null),
    }),
    to: this.qpb.param('dateTo', {
      serialize: (value: Date) => (value && value.toISOString()) || null,
      deserialize: (value) => (value ? new Date(value) : null),
    }),
    groupBy: this.qpb.numberParam('grouBy', {
      emptyOn: TransactionGroup.Unspecified,
      serialize: (value: TransactionGroup) => `${value}`,
      deserialize: (value) => +value,
    }),
    type: this.qpb.numberParam('type', {
      emptyOn: TransactionType.TRANSACTION_TYPE_UNSPECIFIED,
      serialize: (value: TransactionType) => `${value}`,
      deserialize: (value) => +value,
    }),
    status: this.qpb.numberParam('status', {
      emptyOn: TransactionStatus.Unspecified,
      serialize: (value: TransactionStatus) => `${value}`,
      deserialize: (value) => +value,
    }),
  });

  get groupBy(): QueryParam<number> {
    return this.queryFilterGroup.get('groupBy') as QueryParam<number>;
  }

  get type(): QueryParam<number> {
    return this.queryFilterGroup.get('type') as QueryParam<number>;
  }

  get status(): QueryParam<number> {
    return this.queryFilterGroup.get('status') as QueryParam<number>;
  }

  statuses = [
    TransactionStatus.Unspecified,
    TransactionStatus.Failed,
    TransactionStatus.Successfull,
  ];

  types = TransactionTypes;

  currentStats: ITransactionGroup;

  currentGroupKey: string;

  groupList$ = combineLatest(this.currentApplicationId$, this.queryFilterGroup.valueChanges).pipe(
    tap(() => {
      this.drawer.close();
      this.currentStats = null;
    }),
    switchMap(([id, { from, to, groupBy, type, status }]) =>
      this.applicationService
        .getTrasnsactionsGroup(id, from, to, groupBy, status, type)
        .pipe(catchError(() => of({}))),
    ),
    catchError(() => of({})),
    takeUntil(this.destroyed$),
  );

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private applicationService: ApplicationsService,
    private qpb: QueryParamBuilder,
  ) {}

  ngAfterViewInit() {
    this.queryFilterGroup.patchValue({});
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  toSortBy(sortBy: TransactionGroup) {
    return groupTypesToString(sortBy);
  }

  toType(type: TransactionType) {
    return typeToString(type);
  }

  toStatus(status: TransactionStatus) {
    return statusToString(status);
  }

  select(value: ITransactionGroup, key: string) {
    this.currentStats = value;
    this.currentGroupKey = key;
    this.drawer.open();
  }

  onGroupByChange(event: MatSelectChange) {
    this.groupBy.setValue(event.value);
  }

  percent(value: number) {
    return getRoundedPercent(value, 2);
  }

  round(value: number) {
    return roundNumber(value, 2);
  }

  onTypeChange(event: MatSelectChange) {
    this.type.setValue(event.value);
  }

  onStatusChange(event: MatSelectChange) {
    this.status.setValue(event.value);
  }

  goToList() {
    const queryParams: Params = {};
    const value = this.queryFilterGroup.value;
    if (value.from) {
      queryParams[TransactionsListComponent.queryParam.dateFrom] = value.from;
    }
    if (value.to) {
      queryParams[TransactionsListComponent.queryParam.dateTo] = value.to;
    }
    queryParams[TransactionsListComponent.queryParam.status] = value.status;
    queryParams[TransactionsListComponent.queryParam.type] = value.type;
    switch (value.groupBy) {
      case TransactionGroup.Unspecified:
        break;
      case TransactionGroup.Host:
        queryParams[TransactionsListComponent.queryParam.host] = this.currentGroupKey;
        break;
      case TransactionGroup.Method:
        queryParams[TransactionsListComponent.queryParam.method] = this.currentGroupKey;
        break;
      case TransactionGroup.Name:
        queryParams[TransactionsListComponent.queryParam.name] = this.currentGroupKey;
        break;
      case TransactionGroup.Path:
        queryParams[TransactionsListComponent.queryParam.path] = this.currentGroupKey;
        break;

      case TransactionGroup.Type:
        queryParams[TransactionsListComponent.queryParam.type] =
          TransactionType[this.currentGroupKey];
        break;
    }
    console.log(queryParams);
    this.router.navigate(['applications', this.currentAppId, 'list'], {
      queryParams,
    });
  }
}
