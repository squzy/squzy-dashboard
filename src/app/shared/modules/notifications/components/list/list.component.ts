import {
  Component,
  ChangeDetectionStrategy,
  OnChanges,
  OnInit,
  OnDestroy,
  Input,
  SimpleChanges,
} from '@angular/core';
import { Subject, BehaviorSubject, combineLatest } from 'rxjs';
import { OwnerType } from 'src/app/shared/enums/rules.type';
import { NotificationsService } from 'src/app/shared/services/notifications.service';
import { NotificationMethodStatuses } from 'src/app/shared/enums/notifications.type';
import { tap, switchMap, map, takeUntil } from 'rxjs/operators';
import { NotificationMethod } from 'src/app/shared/interfaces/notifications.interface';
import { LinkNotificationMethodModalService } from '../../../modals/link-notification-method/link-notification-method.service';

@Component({
  selector: 'sqd-notifcation-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationListComponent implements OnChanges, OnDestroy {
  private destroyed$ = new Subject();
  @Input() ownerId: string;
  @Input() ownerType: OwnerType;

  private ownerID$ = new BehaviorSubject<string>(this.ownerId);

  private loadingSubject$ = new BehaviorSubject<boolean>(false);

  loading$ = this.loadingSubject$.asObservable();

  private refresh$ = new BehaviorSubject<void>(null);

  private ownerType$ = new BehaviorSubject<OwnerType>(this.ownerType);

  notificationList$ = combineLatest(this.ownerID$, this.ownerType$, this.refresh$).pipe(
    tap(() => this.loadingSubject$.next(true)),
    switchMap(([id, type]) => this.notificationsService.getMethodsByOwner(type, id)),
    map((list) =>
      (list || []).filter(
        (method) => method.status !== NotificationMethodStatuses.NOTIFICATION_STATUS_REMOVED,
      ),
    ),
    tap(() => this.loadingSubject$.next(false)),
    takeUntil(this.destroyed$),
  );

  constructor(
    private notificationsService: NotificationsService,
    private linkNotificationMethodModalService: LinkNotificationMethodModalService,
  ) {}

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  trackByFn(method: NotificationMethod) {
    return method.id;
  }

  link() {
    this.linkNotificationMethodModalService
      .open(this.ownerType, this.ownerId)
      .pipe(takeUntil(this.destroyed$))
      .subscribe((method: NotificationMethod) => {
        if (method && method.id) {
          this.refresh$.next(null);
        }
      });
  }

  unlink(id: string) {
    this.notificationsService
      .unLinkMethod(this.ownerType, this.ownerId, id)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(() => {
        this.refresh$.next(null);
      });
  }

  ngOnChanges(changes: SimpleChanges) {
    if ('ownerId' in changes) {
      this.ownerID$.next(changes.ownerId.currentValue);
    }

    if ('ownerType' in changes) {
      this.ownerType$.next(changes.ownerType.currentValue);
    }
  }
}
