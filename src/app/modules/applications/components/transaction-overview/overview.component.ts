import { Component, ChangeDetectionStrategy, ViewChild, OnDestroy } from '@angular/core';
import { map, switchMap, startWith, tap, takeUntil } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import {
  ApplicationsService,
  TransactionGroupResponse,
  ITransactionGroup,
} from '../../services/applications.service';
import { FormControl } from '@angular/forms';
import { minusMinute } from 'src/app/shared/date/date';
import {
  TransactionGroup,
  groupTypesToString,
  TransactionType,
  typeToString,
  TransactionStatus,
  statusToString,
} from 'src/app/shared/enums/transaction.type';
import { combineLatest, Subject } from 'rxjs';
import { MatDrawer } from '@angular/material/sidenav';

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
export class TransactionsOverviewComponent implements OnDestroy {
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

  dateFrom = new FormControl(this.initValue.dateFrom);

  dateTo = new FormControl(this.initValue.dateTo);

  groupByControl = new FormControl(TransactionGroup.Unspecified);

  typeControl = new FormControl(TransactionType.Unspecified);

  statusControl = new FormControl(TransactionStatus.Unspecified);

  statuses = [
    TransactionStatus.Unspecified,
    TransactionStatus.Failed,
    TransactionStatus.Successfull,
  ];

  types = [
    TransactionType.Unspecified,
    TransactionType.XHR,
    TransactionType.DB,
    TransactionType.FETCH,
    TransactionType.GRPC,
    TransactionType.GRPC,
    TransactionType.HTTP,
    TransactionType.INTERNAL,
    TransactionType.ROUTER,
    TransactionType.WEBSOCKET,
  ];

  currentStats: ITransactionGroup;

  groupList$ = combineLatest(
    this.currentApplicationId$,
    this.dateFrom.valueChanges.pipe(startWith(this.initValue.dateFrom)),
    this.dateTo.valueChanges.pipe(startWith(this.initValue.dateTo)),
    this.groupByControl.valueChanges.pipe(startWith(this.groupByControl.value)),
    this.typeControl.valueChanges.pipe(startWith(this.typeControl.value)),
    this.statusControl.valueChanges.pipe(startWith(this.statusControl.value)),
  ).pipe(
    tap(() => {
      this.drawer.close();
      this.currentStats = null;
    }),
    switchMap(([id, from, to, groupBy, type, status]) =>
      this.applicationService.getTrasnsactionsGroup(id, from, to, groupBy, type, status),
    ),
    takeUntil(this.destroyed$),
  );

  constructor(private route: ActivatedRoute, private applicationService: ApplicationsService) {}

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
}
