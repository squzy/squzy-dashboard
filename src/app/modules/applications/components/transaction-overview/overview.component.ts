import {
  Component,
  ChangeDetectionStrategy,
  ViewChild,
  OnDestroy,
  OnInit,
  AfterViewInit,
} from '@angular/core';
import { map, switchMap, tap, takeUntil, catchError } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
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

  @ViewChild(MatDrawer, { static: true }) drawer: MatDrawer;

  currentApplicationId$ = this.route.parent.params.pipe(
    map((p) => p.id as string),
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
      emptyOn: TransactionType.Unspecified,
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

  select(value: ITransactionGroup) {
    this.currentStats = value;
    this.drawer.open();
  }

  onGroupByChange(event: MatSelectChange) {
    this.groupBy.setValue(event.value);
  }

  onTypeChange(event: MatSelectChange) {
    this.type.setValue(event.value);
  }

  onStatusChange(event: MatSelectChange) {
    this.status.setValue(event.value);
  }
}
