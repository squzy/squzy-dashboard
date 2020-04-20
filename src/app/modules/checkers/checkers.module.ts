import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CheckersService } from './services/checkers.service';
import { ListComponent } from './components/list/list.component';
import { Routes, RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { CheckerComponent } from './components/checker/checker.component';

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
  imports: [CommonModule, RouterModule.forChild(routes), MatTableModule, MatPaginatorModule],
  providers: [CheckersService],
  declarations: [ListComponent, CheckerComponent],
})
export class ChekersModule {}
