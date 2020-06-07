import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
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
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
