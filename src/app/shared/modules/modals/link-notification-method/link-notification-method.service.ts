import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { OwnerType } from 'src/app/shared/enums/rules.type';
import {
  LinkNotificationMethodFormComponent,
  LinkNotificationMethodData,
} from './components/form/form.component';

@Injectable()
export class LinkNotificationMethodModalService {
  constructor(private dialog: MatDialog) {}
  open(ownerType: OwnerType, ownerId: string) {
    return this.dialog
      .open<LinkNotificationMethodFormComponent, LinkNotificationMethodData>(
        LinkNotificationMethodFormComponent,
        {
          data: {
            ownerId,
            ownerType,
          },
        },
      )
      .afterClosed();
  }
}
