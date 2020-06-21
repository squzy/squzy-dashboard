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
import { minusMinute, SECOND } from 'src/app/shared/date/date';
import {
  TransactionGroup,
  TransactionType,
  TransactionStatus,
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
    TransactionGroup.GROUP_TRANSACTION_UNSPECIFIED,
    TransactionGroup.BY_TYPE,
    TransactionGroup.BY_METHOD,
    TransactionGroup.BY_NAME,
    TransactionGroup.BY_HOST,
    TransactionGroup.BY_PATH,
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
      emptyOn: TransactionGroup.GROUP_TRANSACTION_UNSPECIFIED,
      serialize: (value: TransactionGroup) => `${value}`,
      deserialize: (value) => +value,
    }),
    type: this.qpb.numberParam('type', {
      emptyOn: TransactionType.TRANSACTION_TYPE_UNSPECIFIED,
      serialize: (value: TransactionType) => `${value}`,
      deserialize: (value) => +value,
    }),
    status: this.qpb.numberParam('status', {
      emptyOn: TransactionStatus.TRANSACTION_CODE_UNSPECIFIED,
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
    TransactionStatus.TRANSACTION_CODE_UNSPECIFIED,
    TransactionStatus.TRANSACTION_FAILED,
    TransactionStatus.TRANSACTION_SUCCESSFUL,
  ];

  types = TransactionTypes;

  groupByList = TransactionGroup;

  currentStats: ITransactionGroup;

  currentGroupKey: string;

  currentGroupByKey: TransactionGroup = TransactionGroup.GROUP_TRANSACTION_UNSPECIFIED;

  groupList$ = combineLatest(this.currentApplicationId$, this.queryFilterGroup.valueChanges).pipe(
    tap(() => {
      this.drawer.close();
      this.currentStats = null;
    }),
    tap(([id, { from, to, groupBy, type, status }]) => (this.currentGroupByKey = groupBy)),
    switchMap(([id, { from, to, groupBy, type, status }]) =>
      this.applicationService
        .getTrasnsactionsGroup(id, from, to, groupBy, status, type)
        .pipe(catchError(() => of({}))),
    ),
    catchError(() => of({})),
    takeUntil(this.destroyed$),
  );

  SECOND = SECOND;

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
      case TransactionGroup.GROUP_TRANSACTION_UNSPECIFIED:
        break;
      case TransactionGroup.BY_HOST:
        queryParams[TransactionsListComponent.queryParam.host] = this.currentGroupKey;
        break;
      case TransactionGroup.BY_METHOD:
        queryParams[TransactionsListComponent.queryParam.method] = this.currentGroupKey;
        break;
      case TransactionGroup.BY_NAME:
        queryParams[TransactionsListComponent.queryParam.name] = this.currentGroupKey;
        break;
      case TransactionGroup.BY_PATH:
        queryParams[TransactionsListComponent.queryParam.path] = this.currentGroupKey;
        break;

      case TransactionGroup.BY_TYPE:
        queryParams[TransactionsListComponent.queryParam.type] = this.currentGroupKey;
        break;
    }

    this.router.navigate(['applications', this.currentAppId, 'list'], {
      queryParams,
    });
  }

  trackBy(item: { key: string }) {
    return item.key;
  }
}
