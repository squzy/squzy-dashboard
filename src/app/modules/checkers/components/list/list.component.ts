import {
  Component,
  ChangeDetectionStrategy,
  ViewChild,
  OnInit,
  OnDestroy,
  ElementRef,
} from '@angular/core';
import { CheckersService, Scheduler } from '../../services/checkers.service';
import { BehaviorSubject, Subject, combineLatest, fromEvent } from 'rxjs';
import {
  switchMap,
  takeUntil,
  debounceTime,
  distinctUntilChanged,
  mapTo,
  map,
} from 'rxjs/operators';
import { PageEvent, MatPaginator } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { SelectionModel } from '@angular/cdk/collections';
import { AddCheckerService } from 'src/app/shared/modules/modals/add-cheker/add-checker.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'sqd-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListComponent implements OnInit, OnDestroy {
  private readonly refresh$ = new BehaviorSubject(null);
  private destroyed$ = new Subject();
  dataSource = new MatTableDataSource<Scheduler>();

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild('filterInput', { static: true }) filterInput: ElementRef;

  selection = new SelectionModel<Scheduler>(true, []);

  private obs$ = this.refresh$.pipe(switchMap(() => this.checkersService.getList()));

  displayedColumns: string[] = ['select', 'ID', 'name', 'type', 'status'];

  constructor(
    private checkersService: CheckersService,
    private router: Router,
    private addCheckerService: AddCheckerService,
    private translateService: TranslateService,
  ) {}

  ngOnInit() {
    this.dataSource.filterPredicate = (data: Scheduler, filter: string) => {
      return `${data.name ? data.name : ''}_${data.id}_${this.translateService.instant(
        'ENUMS.CHECKERS.STATUS.' + data.status,
      )}_${this.translateService.instant('ENUMS.CHECKERS.TYPE.' + data.type)}`
        .toLocaleLowerCase()
        .includes(filter);
    };
    this.obs$.pipe(takeUntil(this.destroyed$)).subscribe((items) => {
      this.dataSource.data = items;
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });

    fromEvent<KeyboardEvent>(this.filterInput.nativeElement, 'keyup')
      .pipe(
        debounceTime(150),
        map(() =>
          this.filterInput.nativeElement.value ? this.filterInput.nativeElement.value.trim() : '',
        ),
        distinctUntilChanged(),
        takeUntil(this.destroyed$),
      )
      .subscribe((value: string) => [this.applyFilter(value)]);
  }

  isAllSelected() {
    return this.selection.selected.length === this.dataSource.data.length;
  }

  masterToggle() {
    this.isAllSelected()
      ? this.selection.clear()
      : this.dataSource.data.forEach((row) => this.selection.select(row));
  }

  ngOnDestroy() {
    this.destroyed$.next();
  }

  clickRow(row) {
    this.router.navigate(['checkers', row.id]);
  }

  runSelected() {
    combineLatest(...this.selection.selected.map((e) => this.checkersService.runById(e.id)))
      .pipe(takeUntil(this.destroyed$))
      .subscribe(() => {
        this.selection.clear();
        this.refresh$.next(null);
      });
  }

  stopSelected() {
    combineLatest(...this.selection.selected.map((e) => this.checkersService.stopById(e.id)))
      .pipe(takeUntil(this.destroyed$))
      .subscribe(() => {
        this.selection.clear();
        this.refresh$.next(null);
      });
  }

  removeSelected() {
    combineLatest(...this.selection.selected.map((e) => this.checkersService.removeById(e.id)))
      .pipe(takeUntil(this.destroyed$))
      .subscribe(() => {
        this.selection.clear();
        this.refresh$.next(null);
      });
  }

  addChecker() {
    this.addCheckerService
      .open()
      .pipe(takeUntil(this.destroyed$))
      .subscribe((res) => {
        if (res && res.id) {
          this.router.navigate(['checkers', res.id]);
        }
      });
  }

  private applyFilter(text: string) {
    this.dataSource.filter = text.toLocaleLowerCase();
  }
}
