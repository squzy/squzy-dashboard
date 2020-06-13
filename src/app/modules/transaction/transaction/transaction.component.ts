import { Component, ChangeDetectionStrategy } from '@angular/core';
import { TransactionService } from '../services/transaction.service';
import { ActivatedRoute } from '@angular/router';
import { map, switchMap } from 'rxjs/operators';

@Component({
  selector: 'sqd-transactions',
  templateUrl: './transaction.component.html',
  styleUrls: ['./transaction.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransactionComponent {
  rootTransaction$ = this.route.params.pipe(
    map((p) => p.id as string),
    switchMap((id) => this.transactionService.getTransactionById(id)),
  );

  constructor(private route: ActivatedRoute, private transactionService: TransactionService) {}
}
