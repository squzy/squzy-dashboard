import { ListComponent } from './components/list/list.component';
import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { ApplicationComponent } from './components/application/application.component';
import { TransactionsOverviewComponent } from './components/transaction-overview/overview.component';
import { TransactionsListComponent } from './components/transaction-list/list.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatListModule } from '@angular/material/list';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from '@busacca/ng-pick-datetime';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { QueryParamModule } from '@ngqp/core';

const routes: Routes = [
  {
    path: 'list',
    component: ListComponent,
  },
  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full',
  },
  {
    path: ':id',
    children: [
      {
        path: '',
        component: ApplicationComponent,
        children: [
          {
            path: 'list',
            component: TransactionsListComponent,
          },
          {
            path: 'overview',
            component: TransactionsOverviewComponent,
          },
          {
            path: '',
            redirectTo: 'list',
            pathMatch: 'full',
          },
        ],
      },
    ],
  },
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    MatInputModule,
    MatButtonModule,
    MatSortModule,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatCheckboxModule,
    MatCardModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    MatListModule,
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatIconModule,
    MatSidenavModule,
    QueryParamModule,
  ],
  entryComponents: [],
  declarations: [
    ListComponent,
    ApplicationComponent,
    TransactionsOverviewComponent,
    TransactionsListComponent,
  ],
})
export class ApplicationsModule {}
