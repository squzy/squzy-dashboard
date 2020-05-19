import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddCheckerFormComponent } from './add-cheker/add-checker-component/form.component';
import { AddCheckerService } from './add-cheker/add-checker.service';
import { MatDialogModule, MatFormFieldModule, MatCardModule, MatButtonModule, MatChipsModule, MatIconModule } from '@angular/material';
import { ReactiveFormsModule } from '@angular/forms';
import {MatSelectModule} from '@angular/material/select';
import {MatInputModule} from '@angular/material/input';
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
  ],
  exports: [],
  providers: [AddCheckerService],
  declarations: [AddCheckerFormComponent],
  entryComponents: [AddCheckerFormComponent],
})
export class ModalsModule {}
