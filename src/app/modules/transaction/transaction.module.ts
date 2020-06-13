import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TransactionComponent } from './transaction/transaction.component';
import { TransactionService } from './services/transaction.service';

const routes: Routes = [
  {
    path: ':id',
    component: TransactionComponent,
  },
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes)],
  entryComponents: [],
  providers: [TransactionService],
  declarations: [TransactionComponent],
})
export class TransactionModule {}
