import { Component, ViewChild, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map, tap, switchMap, share } from 'rxjs/operators';
import { FormBuilder, FormControl, FormGroupDirective, NgForm } from '@angular/forms';
import { Validators } from '@angular/forms';
import { minusMinute, dateFromToValidator, SECOND } from 'src/app/shared/date/date';
import { ErrorStateMatcher } from '@angular/material/core';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { CheckersService, StatusCode } from '../../services/checkers.service';
import { roundTwoNumber, getRoundedPercent } from 'src/app/shared/numbers/numbers';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { constructor } from 'q';
import { MatSort } from '@angular/material/sort';

class CrossFieldErrorMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    return control.dirty && form.invalid;
  }
}

@Component({
  selector: 'sqd-checker',
  templateUrl: './checker.component.html',
  styleUrls: ['./checker.component.scss'],
})
export class CheckerComponent implements OnInit {
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  private now = Date.now();

  displayedColumns: string[] = ['status', 'startTime', 'endTime'];

  errorMatcher = new CrossFieldErrorMatcher();

  filterForm = this.fb.group(
    {
      dateFrom: [minusMinute(this.now, 10), Validators.required],
      dateTo: [new Date(this.now), Validators.required],
    },
    {
      validators: [dateFromToValidator],
    },
  );

  private _formValue$ = new BehaviorSubject(this.filterForm.value);
  currentId$ = this.route.params.pipe(map((p) => p.id));

  dataSource = new MatTableDataSource();

  checkInfo$ = this.currentId$.pipe(switchMap((id) => this.checkersService.getCheckById(id)));

  history$ = combineLatest(this._formValue$, this.currentId$).pipe(
    switchMap(([value, currentId]) =>
      this.checkersService.getHistory(currentId, value.dateFrom, value.dateTo),
    ),
    tap((items) => (this.dataSource.data = items)),
  );

  uptime$ = this.history$.pipe(
    map((history) => {
      const success = history.filter((e) => e.status === StatusCode.OK);
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
  ) {}

  onSubmit() {
    this._formValue$.next(this.filterForm.value);
  }

  ngOnInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  toStatus(status) {
    return this.checkersService.toStatus(status);
  }

  toType(type) {
    return this.checkersService.toType(type);
  }
}
