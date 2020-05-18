import { Component, ChangeDetectionStrategy, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { CheckersService, Scheduler } from '../../services/checkers.service';
import { BehaviorSubject, Subject, combineLatest } from 'rxjs';
import { switchMap, takeUntil, map } from 'rxjs/operators';
import { PageEvent, MatPaginator } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { SelectionModel } from '@angular/cdk/collections';
import { AddCheckerService } from 'src/app/shared/modules/modals/add-cheker/add-checker.service';

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

  selection = new SelectionModel<Scheduler>(true, []);

  private obs$ = this.refresh$.pipe(switchMap(() => this.checkersService.getList()));

  displayedColumns: string[] = ['select', 'ID', 'type', 'status'];

  constructor(
    private checkersService: CheckersService,
    private router: Router,
    private addCheckerService: AddCheckerService,
  ) {}

  ngOnInit() {
    this.obs$.pipe(takeUntil(this.destroyed$)).subscribe((items) => {
      this.dataSource.data = items;
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
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

  toType(type) {
    return this.checkersService.toType(type);
  }

  toStatus(status) {
    return this.checkersService.toSchedulerStatus(status);
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
      .subscribe(() => {
        this.refresh$.next(null);
      });
  }
}
