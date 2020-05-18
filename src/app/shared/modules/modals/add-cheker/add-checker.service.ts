import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AddCheckerFormComponent } from './add-checker-component/form.component';

@Injectable()
export class AddCheckerService {
  constructor(private dialog: MatDialog) {}
  open() {
    return this.dialog.open(AddCheckerFormComponent).afterClosed();
  }
}
