import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddCheckerFormComponent } from './add-cheker/add-checker-component/form.component';
import { AddCheckerService } from './add-cheker/add-checker.service';
import { MatDialogModule } from '@angular/material';

@NgModule({
  imports: [CommonModule, MatDialogModule],
  exports: [],
  providers: [AddCheckerService],
  declarations: [AddCheckerFormComponent],
  entryComponents: [AddCheckerFormComponent],
})
export class ModalsModule {}
