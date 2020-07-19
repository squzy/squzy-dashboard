import { NgModule } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { Routes, RouterModule } from '@angular/router';
import { AgentsComponent } from './components/overview/agents.component';
import { CommonModule } from '@angular/common';
import { AgentsService } from 'src/app/modules/agents/services/agents.service';
import { StatsModule } from '../stats/stats.modules';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from '@busacca/ng-pick-datetime';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { TranslateModule } from '@ngx-translate/core';
import { RulesModule } from 'src/app/shared/modules/rules/rules.module';
import { NotificationListModule } from 'src/app/shared/modules/notifications/notifications-list.module';

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
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    MatTabsModule,
    StatsModule,
    MatIconModule,
    MatCardModule,
    MatCheckboxModule,
    MatFormFieldModule,
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    ReactiveFormsModule,
    MatInputModule,
    RulesModule,
    NotificationListModule,
    TranslateModule.forChild({}),
  ],
  declarations: [AgentsComponent],
  providers: [AgentsService],
})
export class AgentsModule {}
