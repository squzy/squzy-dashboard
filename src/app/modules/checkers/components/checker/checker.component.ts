import { Component, ViewChild, OnInit, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map, tap, switchMap, takeUntil } from 'rxjs/operators';
import { FormBuilder, FormControl, FormGroupDirective, NgForm } from '@angular/forms';
import { Validators } from '@angular/forms';
import { minusMinute, dateFromToValidator, SECOND } from 'src/app/shared/date/date';
import { ErrorStateMatcher } from '@angular/material/core';
import { BehaviorSubject, combineLatest, Subject } from 'rxjs';
import {
  CheckersService,
  SchedulerStatus,
  SchedulerResponseCode,
  Scheduler,
} from '../../services/checkers.service';
import { roundTwoNumber, getRoundedPercent } from 'src/app/shared/numbers/numbers';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { SchedulerConfigComponent } from './config/config.component';

class CrossFieldErrorMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    return control.dirty && form.invalid;
  }
}

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

  private readonly refresh$ = new BehaviorSubject(null);

  dateNow = new Date(Date.now());

  displayedColumns: string[] = ['status', 'startTime', 'endTime'];

  errorMatcher = new CrossFieldErrorMatcher();

  filterForm = this.fb.group(
    {
      dateFrom: [minusMinute(+this.dateNow, 10), Validators.required],
      dateTo: [this.dateNow, Validators.required],
    },
    {
      validators: [dateFromToValidator],
    },
  );

  statuses = SchedulerStatus;

  formValue$ = new BehaviorSubject(this.filterForm.value);

  currentId$ = combineLatest(this.refresh$, this.route.params.pipe(map((p) => p.id))).pipe(
    map(([_, id]) => id),
  );

  dataSource = new MatTableDataSource();

  checkInfo$ = this.currentId$.pipe(switchMap((id) => this.checkersService.getById(id)));

  history$ = combineLatest(this.formValue$, this.currentId$).pipe(
    switchMap(([value, currentId]) =>
      this.checkersService.getHistory(currentId, value.dateFrom, value.dateTo),
    ),
    tap(() => (this.dateNow = new Date(Date.now()))),
    tap((items) => (this.dataSource.data = items)),
  );

  uptime$ = this.history$.pipe(
    map((history) => {
      const success = history.filter((e) => e.status === SchedulerResponseCode.OK);
      return getRoundedPercent(success.length / history.length);
    }),
  );

  latency$ = this.history$.pipe(
    map((history) => {
      const latencyAccum = history.reduce((prev, current) => {
        return prev + current.endTime - current.startTime;
      }, 0);
      return roundTwoNumber(latencyAccum / history.length / SECOND);
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
}
