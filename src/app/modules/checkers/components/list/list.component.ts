import { Component, ChangeDetectionStrategy, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { CheckersService } from '../../services/checkers.service';
import { BehaviorSubject, Subject } from 'rxjs';
import { switchMap, takeUntil } from 'rxjs/operators';
import { PageEvent, MatPaginator } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';

@Component({
  selector: 'sqd-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListComponent implements OnInit, OnDestroy {
  dataSource = new MatTableDataSource();

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  private obs$ = this.checkersService.getList();

  displayedColumns: string[] = ['ID', 'type', 'status'];

  private destroyed$ = new Subject();

  constructor(private checkersService: CheckersService, private router: Router) {}

  ngOnInit() {
    this.obs$.pipe(takeUntil(this.destroyed$)).subscribe((items) => {
      this.dataSource.data = items;
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
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
}
