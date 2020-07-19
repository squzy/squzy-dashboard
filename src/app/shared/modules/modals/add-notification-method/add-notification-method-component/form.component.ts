import { Component, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { NotificationMethodType } from 'src/app/shared/enums/notifications.type';
import { Subject } from 'rxjs';
import { Validators, FormBuilder } from '@angular/forms';
import { URL_REGEXP } from 'src/app/shared/validators/urls.validators';
import { NotificationsService } from 'src/app/shared/services/notifications.service';
import { MatSelectChange } from '@angular/material/select';
import { takeUntil } from 'rxjs/operators';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'sqd-dialog-add-notification-method',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddNotificationMethodFormComponent implements OnDestroy {
  private destoryed$ = new Subject();
  WebhookType = NotificationMethodType.NOTIFICATION_METHOD_WEBHOOK;
  SlackType = NotificationMethodType.NOTIFICATION_METHOD_SLACK;
  notificationMethodsType = [this.WebhookType, this.SlackType];

  slackConfig = this.fb.group({
    url: ['', Validators.compose([Validators.required, Validators.pattern(URL_REGEXP)])],
  });

  webhookConfig = this.fb.group({
    url: ['', Validators.compose([Validators.required, Validators.pattern(URL_REGEXP)])],
  });

  private configMap = {
    [NotificationMethodType.NOTIFICATION_METHOD_WEBHOOK]: this.fb.group({
      webhookConfig: this.webhookConfig,
    }),
    [NotificationMethodType.NOTIFICATION_METHOD_SLACK]: this.fb.group({
      slackConfig: this.slackConfig,
    }),
  };

  form = this.fb.group({
    type: [null, Validators.required],
    name: [null, Validators.required],
    config: [null],
  });

  constructor(
    private dialogRef: MatDialogRef<AddNotificationMethodFormComponent>,
    private fb: FormBuilder,
    private notificationsService: NotificationsService,
  ) {}

  changeType(event: MatSelectChange) {
    this.form.setControl('config', this.configMap[event.value]);
  }

  onSubmit() {
    if (!this.form.valid) {
      return;
    }
    const formValue = this.form.value;

    const rq = {
      type: formValue.type,
      name: formValue.name,
      timeout: formValue.timeout,
      interval: formValue.interval,
      ...formValue.config,
    };

    this.notificationsService
      .createMethod(rq)
      .pipe(takeUntil(this.destoryed$))
      .subscribe((res) => {
        this.dialogRef.close(res);
      });
  }

  ngOnDestroy() {
    this.destoryed$.next();
    this.destoryed$.complete();
  }
}
