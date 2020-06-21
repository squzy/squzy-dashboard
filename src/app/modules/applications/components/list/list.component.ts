import {
  Component,
  ChangeDetectionStrategy,
  ViewChild,
  ElementRef,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { Application, ApplicationsService } from '../../services/applications.service';
import { Subject, BehaviorSubject, fromEvent, combineLatest } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { SelectionModel } from '@angular/cdk/collections';
import { switchMap, takeUntil, debounceTime, map, distinctUntilChanged } from 'rxjs/operators';
import { ApplicationStatus } from 'src/app/shared/enums/application.type';
import { Router } from '@angular/router';
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
  dataSource = new MatTableDataSource<Application>();

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild('filterInput', { static: true }) filterInput: ElementRef;

  selection = new SelectionModel<Application>(true, []);

  private obs$ = this.refresh$.pipe(switchMap(() => this.applicationsService.getList()));

  displayedColumns: string[] = ['select', 'id', 'name', 'host', 'status'];

  constructor(
    private applicationsService: ApplicationsService,
    private router: Router,
    private translateService: TranslateService,
  ) {}

  ngOnInit() {
    this.dataSource.filterPredicate = (data: Application, filter: string) => {
      return `${data.name ? data.name : ''}_${data.id}_${this.translateService.instant(
        'ENUMS.APPLICATIONS.STATUS.' + data.status,
      )}_${data.host_name}}`
        .toLocaleLowerCase()
        .includes(filter);
    };
    this.obs$.pipe(takeUntil(this.destroyed$)).subscribe((items) => {
      this.dataSource.data = items || [];
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

  private applyFilter(text: string) {
    this.dataSource.filter = text.toLocaleLowerCase();
  }

  enabled() {
    const arr = this.selection.selected.filter(
      (e) => e.status === ApplicationStatus.APPLICATION_STATUS_DISABLED,
    );
    if (!arr.length) {
      this.selection.clear();
    }
    combineLatest(arr.map((e) => this.applicationsService.enabled(e.id)))
      .pipe(takeUntil(this.destroyed$))
      .subscribe(() => {
        this.selection.clear();
        this.refresh$.next(null);
      });
  }

  disabled() {
    const arr = this.selection.selected.filter(
      (e) => e.status === ApplicationStatus.APPLICATION_STATUS_ENABLED,
    );
    if (!arr.length) {
      this.selection.clear();
    }
    combineLatest(arr.map((e) => this.applicationsService.disabled(e.id)))
      .pipe(takeUntil(this.destroyed$))
      .subscribe(() => {
        this.selection.clear();
        this.refresh$.next(null);
      });
  }

  archived() {
    const arr = this.selection.selected.filter(
      (e) => e.status !== ApplicationStatus.APPLICATION_STATUS_ARCHIVED,
    );
    if (!arr.length) {
      this.selection.clear();
    }
    combineLatest(arr.map((e) => this.applicationsService.archived(e.id)))
      .pipe(takeUntil(this.destroyed$))
      .subscribe(() => {
        this.selection.clear();
        this.refresh$.next(null);
      });
  }

  clickRow(row) {
    this.router.navigate(['applications', row.id]);
  }
}
