import { NgModule } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { Routes, RouterModule } from '@angular/router';
import { AgentsComponent } from './components/overview/agents.component';
import { CommonModule } from '@angular/common';
import { AgentsService } from 'src/app/shared/services/agents.service';
import { StatsModule } from '../stats/stats.modules';
import { MatIconModule } from '@angular/material/icon';

const routes: Routes = [
  {
    path: ':id',
    children: [
      {
        path: '',
        redirectTo: AgentsService.LIVE,
        pathMatch: 'full',
      },
      {
        path: ':type',
        component: AgentsComponent,
      },
    ],
  },
  {
    path: '',
    component: AgentsComponent,
  },
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), MatTabsModule, StatsModule, MatIconModule],
  declarations: [AgentsComponent],
})
export class AgentsModule {}
