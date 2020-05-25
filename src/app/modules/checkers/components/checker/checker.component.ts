import { Component, ViewChild, OnInit, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map, tap, switchMap, takeUntil, share, mapTo } from 'rxjs/operators';
import { FormBuilder, FormControl, FormGroupDirective, NgForm } from '@angular/forms';
import { Validators } from '@angular/forms';
import { minusMinute, SECOND, timeToDate, Time, diffInSec } from 'src/app/shared/date/date';
import { ErrorStateMatcher } from '@angular/material/core';
import { BehaviorSubject, combineLatest, Subject, timer, of } from 'rxjs';
import {
  CheckersService,
  SchedulerStatus,
  SchedulerResponseCode,
  Scheduler,
  HistoryItem,
} from '../../services/checkers.service';
import { roundNumber, getRoundedPercent } from 'src/app/shared/numbers/numbers';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { SchedulerConfigComponent } from './config/config.component';
import { dateFromToValidator } from 'src/app/shared/validators/date.validators';
import { SchedulerSnapshotComponent } from './snapshot/snapshot.component';

class CrossFieldErrorMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    return control.dirty && form.invalid;
  }
}

function getFilterValue() {
  const now = new Date(Date.now());
  return {
    dateFrom: minusMinute(+now, 10),
    dateTo: now,
  };
}

const initailValue = getFilterValue();

@Component({
  selector: 'sqd-checker',
  templateUrl: './checker.component.html',
  styleUrls: ['./checker.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckerComponent implements OnInit, OnDestroy {
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  private destoryed$ = new Subject();

  private autoRefresh_$ = new BehaviorSubject(false);

  private readonly refresh$ = new BehaviorSubject(null);

  dateNow = initailValue.dateTo;

  displayedColumns: string[] = ['status', 'startTime', 'endTime', 'latency'];

  errorMatcher = new CrossFieldErrorMatcher();

  filterForm = this.fb.group(
    {
      dateFrom: [initailValue.dateFrom, Validators.required],
      dateTo: [this.dateNow, Validators.required],
    },
    {
      validators: [dateFromToValidator],
    },
  );

  statuses = SchedulerStatus;

  responseStatuses = SchedulerResponseCode;

  formValue$ = new BehaviorSubject(this.filterForm.value);

  currentId$ = this.route.params.pipe(map((p) => p.id));

  dataSource = new MatTableDataSource<HistoryItem>();

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
      const newValue = getFilterValue();
      this.filterForm.setValue({
        dateFrom: newValue.dateFrom,
        dateTo: newValue.dateTo,
      });
      this.onSubmit();
    }),
  );

  history$ = combineLatest(this.formValue$, this.currentId$).pipe(
    switchMap(([value, currentId]) =>
      this.checkersService.getHistory(currentId, value.dateFrom, value.dateTo),
    ),
    map((v) => v.snapshots || []),
    tap(() => (this.dateNow = new Date(Date.now()))),
    tap((items) => (this.dataSource.data = items)),
    share(),
  );

  uptime$ = this.history$.pipe(
    map((history) => {
      const success = history.filter((e) => e.code === SchedulerResponseCode.OK);
      return getRoundedPercent(success.length / history.length);
    }),
  );

  latency$ = this.history$.pipe(
    map((history) => {
      const latencyAccum = history.reduce((prev, current) => {
        if (current.code !== SchedulerResponseCode.OK) {
          return prev;
        }
        return prev + diffInSec(current.meta.end_time, current.meta.start_time);
      }, 0);
      return roundNumber(latencyAccum / history.length / SECOND, 3);
    }),
  );

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private checkersService: CheckersService,
    private _bottomSheet: MatBottomSheet,
  ) {}

  onSubmit() {
    this.formValue$.next(this.filterForm.value);
  }

  showConfig(config: Scheduler) {
    this._bottomSheet.open(SchedulerConfigComponent, {
      data: config,
    });
  }

  ngOnInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.dataSource.sortingDataAccessor = (item, property): string | number => {
      switch (property) {
        case 'startTime':
          return +timeToDate(item.meta.start_time);
        case 'endTime':
          return +timeToDate(item.meta.end_time);
        case 'latency':
          return +diffInSec(item.meta.end_time, item.meta.start_time);
        default:
          return item[property];
      }
    };
  }

  ngOnDestroy() {
    this.destoryed$.next();
  }

  run(id: string) {
    this.checkersService
      .runById(id)
      .pipe(takeUntil(this.destoryed$))
      .subscribe(() => this.refresh$.next(null));
  }

  stop(id: string) {
    this.checkersService
      .stopById(id)
      .pipe(takeUntil(this.destoryed$))
      .subscribe(() => this.refresh$.next(null));
  }

  remove(id: string) {
    this.checkersService
      .removeById(id)
      .pipe(takeUntil(this.destoryed$))
      .subscribe(() => this.refresh$.next(null));
  }

  toSchedulerStatus(status) {
    return this.checkersService.toSchedulerStatus(status);
  }

  toResponseStatus(status) {
    return this.checkersService.toSchedulerResponseStatus(status);
  }

  toType(type) {
    return this.checkersService.toType(type);
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

  toggleAutoRefresh() {
    this.autoRefresh_$.next(!this.autoRefresh_$.value);
  }
}
