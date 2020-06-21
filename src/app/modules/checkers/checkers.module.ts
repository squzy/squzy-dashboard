import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CheckersService } from './services/checkers.service';
import { ListComponent } from './components/list/list.component';
import { Routes, RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { CheckerComponent } from './components/checker/checker.component';
import { MatCardModule } from '@angular/material/card';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from '@busacca/ng-pick-datetime';
import { ReactiveFormsModule } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSortModule } from '@angular/material/sort';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { SchedulerConfigComponent } from './components/checker/config/config.component';
import { SchedulerSnapshotComponent } from './components/checker/snapshot/snapshot.component';
import { MatSelectModule } from '@angular/material/select';
import { TranslateModule } from '@ngx-translate/core';

const routes: Routes = [
  {
    path: 'list',
    component: ListComponent,
  },
  {
    path: ':id',
    component: CheckerComponent,
  },
  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    MatSelectModule,
    MatTableModule,
    MatPaginatorModule,
    MatCardModule,
    MatFormFieldModule,
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatSortModule,
    MatBottomSheetModule,
    MatTooltipModule,
    MatIconModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    TranslateModule.forChild({}),
  ],
  providers: [CheckersService],
  declarations: [
    ListComponent,
    CheckerComponent,
    SchedulerConfigComponent,
    SchedulerSnapshotComponent,
  ],
  entryComponents: [SchedulerConfigComponent, SchedulerSnapshotComponent],
})
export class ChekersModule {}
