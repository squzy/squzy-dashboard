import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CheckersService } from './services/checkers.service';
import { ListComponent } from './components/list/list.component';
import { Routes, RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { CheckerComponent } from './components/checker/checker.component';
import { MatCardModule } from '@angular/material/card';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSortModule } from '@angular/material/sort';

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
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatCardModule,
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatSortModule,
  ],
  providers: [CheckersService],
  declarations: [ListComponent, CheckerComponent],
})
export class ChekersModule {}
