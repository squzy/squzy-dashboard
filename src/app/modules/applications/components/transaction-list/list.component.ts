import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'sqd-transactions-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransactionsListComponent {}
