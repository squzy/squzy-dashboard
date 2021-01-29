import { Component, ViewChild, OnInit, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map, tap, switchMap, takeUntil, share, mapTo, startWith } from 'rxjs/operators';
import { FormBuilder, FormControl, FormGroupDirective, NgForm } from '@angular/forms';
import { Validators } from '@angular/forms';
import {
  minusMinute,
  SECOND,
  timeToDate,
  Time,
  diffInSec,
  FormRangeValue,
  MS_TO_NANOS,
} from 'src/app/shared/date/date';
import { ErrorStateMatcher } from '@angular/material/core';
import { BehaviorSubject, combineLatest, Subject, timer, of } from 'rxjs';
import { CheckersService, Scheduler, HistoryItem } from '../../services/checkers.service';
import { roundNumber, getRoundedPercent } from 'src/app/shared/numbers/numbers';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { QueryParam, QueryParamBuilder } from '@ngqp/core';
import { SchedulerConfigComponent } from './config/config.component';
import { dateFromToValidator } from 'src/app/shared/validators/date.validators';
import { SchedulerSnapshotComponent } from './snapshot/snapshot.component';
import { CheckerDataSource } from './datasource/checker.datasource';
import { angularSortDirectionMap } from 'src/app/shared/enums/sort.table';
import {
  SchedulerStatus,
  SchedulerResponseCode,
  SortSchedulerList,
} from 'src/app/shared/enums/schedulers.type';
import { OwnerType } from 'src/app/shared/enums/rules.type';

function getFilterValue() {
  const now = new Date(Date.now());
  return {
    dateFrom: minusMinute(+now, 10),
    dateTo: now,
  };
}

@Component({
  selector: 'sqd-checker',
  templateUrl: './checker.component.html',
  styleUrls: ['./checker.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckerComponent implements OnInit, OnDestroy {
  static queryParam = {
    dateTo: 'dateTo',
    dateFrom: 'dateFrom',
  };

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  private destroyed$ = new Subject();

  pageSizes = [5, 10, 20, 100];

  private autoRefresh_$ = new BehaviorSubject(false);

  private readonly refresh$ = new BehaviorSubject(null);

  private readonly refresh_table$ = new Subject();

  initailValue = getFilterValue();

  dateNow = this.initailValue.dateTo;

  displayedColumns: string[] = ['status', 'startTime', 'endTime', 'latency'];

  private sortMap = {
    startTime: SortSchedulerList.BY_START_TIME,
    endTime: SortSchedulerList.BY_END_TIME,
    latency: SortSchedulerList.BY_LATENCY,
  };

  filterForm = this.qpb.group({
    [CheckerComponent.queryParam.dateFrom]: this.qpb.param(CheckerComponent.queryParam.dateFrom, {
      serialize: (value: Date) => (value && value.toISOString()) || null,
      deserialize: (value) => (value ? new Date(value) : null),
    }),
    [CheckerComponent.queryParam.dateTo]: this.qpb.param(CheckerComponent.queryParam.dateTo, {
      serialize: (value: Date) => (value && value.toISOString()) || null,
      deserialize: (value) => (value ? new Date(value) : null),
    }),
  });

  statuses = SchedulerStatus;

  responseStatuses = SchedulerResponseCode;

  currentId$ = this.route.params.pipe(map((p) => p.id as string));

  SCHDEDULER_TYPE = OwnerType.INCIDENT_OWNER_TYPE_SCHEDULER;

  dataSource = new CheckerDataSource(this.checkersService);

  checkInfo$ = combineLatest(this.refresh$, this.currentId$).pipe(
    switchMap(([_, id]) => this.checkersService.getById(id)),
    share(),
  );

  autoRefresh$ = combineLatest(this.checkInfo$, this.autoRefresh_$).pipe(
    switchMap(([config, value]) =>
      value ? timer(0, config.interval * 1000).pipe(mapTo(true)) : of(false),
    ),
    tap((value) => {
      if (!value) {
        return;
      }
      this.refresh_table$.next();
    }),
  );

  currentValue$ = this.filterForm.valueChanges.pipe(
    tap((value) => {
      if (value.dateTo) {
        this.autoRefresh_$.next(false);
      }
    }),
  );

  uptime$ = combineLatest(this.currentId$, this.currentValue$).pipe(
    switchMap(([id, value]) =>
      this.checkersService.getUptimeById(id, value.dateFrom, value.dateTo),
    ),
    map((value) => ({
      uptime: getRoundedPercent(value.uptime),
      latency: roundNumber(value.latency / (SECOND * MS_TO_NANOS), 3),
      dateFrom: value.from,
      dateTo: value.to,
    })),
  );

  statusCode = [
    this.responseStatuses.SCHEDULER_CODE_UNSPECIFIED,
    this.responseStatuses.ERROR,
    this.responseStatuses.OK,
  ];

  statusControl = new FormControl(this.responseStatuses.SCHEDULER_CODE_UNSPECIFIED);

  constructor(
    private route: ActivatedRoute,
    private qpb: QueryParamBuilder,
    private checkersService: CheckersService,
    private _bottomSheet: MatBottomSheet,
  ) {}

  ngOnInit() {
    combineLatest(
      this.currentId$,
      this.currentValue$,
      this.sort.sortChange,
      this.paginator.page,
      this.statusControl.valueChanges.pipe(startWith(this.statusControl.value)),
      this.refresh_table$.pipe(startWith(null)),
    )
      .pipe(
        switchMap(
          ([id, formValue, sort, page, status, _]: [
            string,
            FormRangeValue,
            Sort,
            PageEvent,
            SchedulerResponseCode,
            undefined,
          ]) =>
            this.dataSource.load(
              id,
              formValue.dateFrom,
              formValue.dateTo,
              page.pageSize,
              page.pageIndex + 1,
              this.sortMap[sort.active]
                ? this.sortMap[sort.active]
                : SortSchedulerList.SORT_SCHEDULER_LIST_UNSPECIFIED,
              angularSortDirectionMap[sort.direction],
              status,
            ),
        ),
        takeUntil(this.destroyed$),
      )
      .subscribe();

    this.dataSource.count$.pipe(takeUntil(this.destroyed$)).subscribe((value) => {
      this.paginator.length = value;
    });

    this.sort.sort({
      id: 'startTime',
      start: 'desc',
      disableClear: true,
    });
    this.paginator.page.emit({
      pageIndex: 0,
      pageSize: this.pageSizes[0],
      length: 0,
    });
  }

  showConfig(config: Scheduler) {
    this._bottomSheet.open(SchedulerConfigComponent, {
      data: config,
    });
  }

  ngOnDestroy() {
    this.destroyed$.next();
  }

  run(id: string) {
    this.checkersService
      .runById(id)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(() => this.refresh$.next(null));
  }

  stop(id: string) {
    this.checkersService
      .stopById(id)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(() => this.refresh$.next(null));
  }

  remove(id: string) {
    this.checkersService
      .removeById(id)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(() => this.refresh$.next(null));
  }

  toDate(time: Time) {
    return timeToDate(time);
  }

  getLatency(a: Time, b: Time) {
    return roundNumber(diffInSec(a, b) / SECOND, 3);
  }

  clickRow(snapshot: HistoryItem) {
    this._bottomSheet.open(SchedulerSnapshotComponent, {
      data: snapshot,
    });
  }

  clearControl(key: string) {
    this.filterForm.patchValue({
      [key]: null,
    });
  }

  toggleAutoRefresh() {
    this.autoRefresh_$.next(!this.autoRefresh_$.value);
  }
}
