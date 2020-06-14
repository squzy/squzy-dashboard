import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TransactionComponent } from './transaction/transaction.component';
import { TransactionService } from './services/transaction.service';
import { MatCardModule } from '@angular/material/card';
import { TransactionSegmentComponent } from './transaction/segment/segment.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';

const routes: Routes = [
  {
    path: ':id',
    component: TransactionComponent,
  },
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
  ],
  entryComponents: [],
  providers: [TransactionService],
  declarations: [TransactionComponent, TransactionSegmentComponent],
})
export class TransactionModule {}
