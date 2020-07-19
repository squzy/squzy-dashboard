import { Routes, RouterModule } from '@angular/router';
import { HomePageComponent } from './components/page/page.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';

const routes: Routes = [
  {
    path: '',
    component: HomePageComponent,
  },
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    MatCardModule,
    MatIconModule,
    TranslateModule.forChild({}),
  ],
  declarations: [HomePageComponent],
})
export class HomeModule {}
