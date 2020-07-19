import { Component, ChangeDetectionStrategy, OnDestroy, Inject } from '@angular/core';
import { Subject } from 'rxjs';
import { OwnerType } from 'src/app/shared/enums/rules.type';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, Validators } from '@angular/forms';
import { NotificationsService } from 'src/app/shared/services/notifications.service';
import { map, takeUntil } from 'rxjs/operators';
import { NotificationMethodStatuses } from 'src/app/shared/enums/notifications.type';
import { NotificationMethod } from 'src/app/shared/interfaces/notifications.interface';

export interface LinkNotificationMethodData {
  ownerType: OwnerType;
  ownerId: string;
}

@Component({
  selector: 'sqd-dialog-link-notification-method',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LinkNotificationMethodFormComponent implements OnDestroy {
  private destroyed$ = new Subject();

  form = this.fb.group({
    id: [null, Validators.required],
  });

  listOfMethods$ = this.notificationsService.getList().pipe(
    map((items) =>
      (items || []).filter(
        (e) => e.status !== NotificationMethodStatuses.NOTIFICATION_STATUS_REMOVED,
      ),
    ),
    takeUntil(this.destroyed$),
  );

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: LinkNotificationMethodData,
    private fb: FormBuilder,
    private notificationsService: NotificationsService,
    private dialogRef: MatDialogRef<LinkNotificationMethodFormComponent>,
  ) {}

  onSubmit() {
    if (!this.form.valid) {
      return;
    }
    this.notificationsService
      .linkMethod(this.data.ownerType, this.data.ownerId, this.form.get('id').value)
      .pipe(takeUntil(this.destroyed$))
      .subscribe((res) => {
        this.dialogRef.close(res);
      });
  }

  trackByFn(method: NotificationMethod) {
    return method.id;
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}
