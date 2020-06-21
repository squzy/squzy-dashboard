import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddCheckerFormComponent } from './add-cheker/add-checker-component/form.component';
import { AddCheckerService } from './add-cheker/add-checker.service';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { TranslateModule } from '@ngx-translate/core';
@NgModule({
  imports: [
    CommonModule,
    MatDialogModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatCardModule,
    MatButtonModule,
    MatChipsModule,
    MatIconModule,
    TranslateModule.forChild({}),
  ],
  exports: [],
  providers: [AddCheckerService],
  declarations: [AddCheckerFormComponent],
  entryComponents: [AddCheckerFormComponent],
})
export class ModalsModule {}
