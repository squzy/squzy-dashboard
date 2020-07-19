import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { NotificationMethod } from 'src/app/shared/interfaces/notifications.interface';
import { Subject, BehaviorSubject, fromEvent, combineLatest } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { NotificationsService } from 'src/app/shared/services/notifications.service';
import { TranslateService } from '@ngx-translate/core';
import { takeUntil, debounceTime, map, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { SelectionModel } from '@angular/cdk/collections';
import { NotificationMethodStatuses } from 'src/app/shared/enums/notifications.type';
import { AddNotificationMethodService } from 'src/app/shared/modules/modals/add-notification-method/add-notification-method.service';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { SchedulerConfigComponent } from './config/config.component';

@Component({
  selector: 'sqd-notification-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListComponent implements OnInit, OnDestroy {
  private readonly refresh$ = new BehaviorSubject(null);
  private destroyed$ = new Subject();
  dataSource = new MatTableDataSource<NotificationMethod>();

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild('filterInput', { static: true }) filterInput: ElementRef;

  selection = new SelectionModel<NotificationMethod>(true, []);
  displayedColumns: string[] = ['select', 'ID', 'name', 'status', 'type'];

  private obs$ = this.refresh$.pipe(
    switchMap(() => this.notificationsService.getList()),
    map((items) =>
      (items || []).filter(
        (e) => e.status !== NotificationMethodStatuses.NOTIFICATION_STATUS_REMOVED,
      ),
    ),
    takeUntil(this.destroyed$),
  );
  constructor(
    private translateService: TranslateService,
    private notificationsService: NotificationsService,
    private addNotificationMethodService: AddNotificationMethodService,
    private _bottomSheet: MatBottomSheet,
  ) {}

  ngOnInit() {
    this.dataSource.filterPredicate = (data: NotificationMethod, filter: string) => {
      return `${data.name ? data.name : ''}_${data.id}_${this.translateService.instant(
        'ENUMS.NOTIFICATION_METHODS.STATUS.' + data.status,
      )}_${this.translateService.instant('ENUMS.NOTIFICATION_METHODS.TYPE.' + data.type)}`
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
    this.destroyed$.complete();
  }

  activateSelected() {
    combineLatest(
      ...this.selection.selected.map((e) => this.notificationsService.activateById(e.id)),
    )
      .pipe(takeUntil(this.destroyed$))
      .subscribe(() => {
        this.selection.clear();
        this.refresh$.next(null);
      });
  }

  deactivateSelected() {
    combineLatest(
      ...this.selection.selected.map((e) => this.notificationsService.deactivateById(e.id)),
    )
      .pipe(takeUntil(this.destroyed$))
      .subscribe(() => {
        this.selection.clear();
        this.refresh$.next(null);
      });
  }

  removeSelected() {
    combineLatest(...this.selection.selected.map((e) => this.notificationsService.deleteById(e.id)))
      .pipe(takeUntil(this.destroyed$))
      .subscribe(() => {
        this.selection.clear();
        this.refresh$.next(null);
      });
  }

  addMethod() {
    this.addNotificationMethodService
      .open()
      .pipe(takeUntil(this.destroyed$))
      .subscribe((res) => {
        if (res && res.id) {
          this.refresh$.next(null);
        }
      });
  }

  clickRow(method: NotificationMethod) {
    this._bottomSheet.open(SchedulerConfigComponent, {
      data: method,
    });
  }

  private applyFilter(text: string) {
    this.dataSource.filter = text.toLocaleLowerCase();
  }
}
