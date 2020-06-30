import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListComponent } from './components/list/list.component';
import { IncidentComponent } from './components/incident/incident.component';

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
  imports: [CommonModule, RouterModule.forChild(routes)],
})
export class IncidentsModule {}
