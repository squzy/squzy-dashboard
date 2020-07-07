import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListComponent } from './components/list/list.component';
import { IncidentComponent } from './components/incident/incident.component';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from '@busacca/ng-pick-datetime';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { TranslateModule } from '@ngx-translate/core';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { QueryParamModule } from '@ngqp/core';
import { MatCardModule } from '@angular/material/card';
import { MatSortModule } from '@angular/material/sort';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

const routes: Routes = [
  {
    path: 'list',
    component: ListComponent,
  },
  {
    path: ':id',
    component: IncidentComponent,
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
    MatCardModule,
    MatSortModule,
    RouterModule.forChild(routes),
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    ReactiveFormsModule,
    MatInputModule,
    TranslateModule.forChild({}),
    MatSelectModule,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    QueryParamModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatIconModule,
  ],
  declarations: [ListComponent, IncidentComponent],
})
export class IncidentsModule {}
