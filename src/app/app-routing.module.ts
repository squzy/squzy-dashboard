import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./modules/home/home.modules').then((m) => m.HomeModule),
  },
  {
    path: 'agents',
    loadChildren: () => import('./modules/agents/agents.module').then((m) => m.AgentsModule),
  },
  {
    path: 'checkers',
    loadChildren: () => import('./modules/checkers/checkers.module').then((m) => m.ChekersModule),
  },
  {
    path: 'applications',
    loadChildren: () =>
      import('./modules/applications/applications.module').then((m) => m.ApplicationsModule),
  },
  {
    path: 'transactions',
    loadChildren: () =>
      import('./modules/transaction/transaction.module').then((m) => m.TransactionModule),
  },
  {
    path: 'incidents',
    loadChildren: () =>
      import('./modules/incidents/incidents.module').then((m) => m.IncidentsModule),
  },
  {
    path: 'notification-methods',
    loadChildren: () =>
      import('./modules/notifications/notification.module').then(
        (m) => m.NotificationMethodsModule,
      ),
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
