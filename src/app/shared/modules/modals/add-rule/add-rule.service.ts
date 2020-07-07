import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AddRuleFormComponent, AddRuleData } from './add-rule-component/add-rule.component';
import { OwnerType } from 'src/app/shared/enums/rules.type';

@Injectable()
export class AddRuleService {
  constructor(private dialog: MatDialog) {}
  open(ownerType: OwnerType, ownerId: string) {
    return this.dialog
      .open<AddRuleFormComponent, AddRuleData>(AddRuleFormComponent, {
        data: {
          ownerId,
          ownerType,
        },
      })
      .afterClosed();
  }
}
