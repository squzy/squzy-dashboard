import { AddNotificationMethodFormComponent } from './add-notification-method-component/form.component';
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

@Injectable()
export class AddNotificationMethodService {
  constructor(private dialog: MatDialog) {}
  open() {
    return this.dialog
      .open<AddNotificationMethodFormComponent>(AddNotificationMethodFormComponent)
      .afterClosed();
  }
}
