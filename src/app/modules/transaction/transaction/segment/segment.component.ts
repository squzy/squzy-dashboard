import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Transaction } from 'src/app/shared/interfaces/transaction.interfaces';
import { TransactionWithChildren } from '../../services/transaction.service';
import { timeToDate, diffInSec } from 'src/app/shared/date/date';
import { Router } from '@angular/router';
import { TransactionStatus } from 'src/app/shared/enums/transaction.type';

interface Information {
  left: string;
  width: string;
  padding: string;
  leftTime: Date;
  rightTime: Date;
}

@Component({
  selector: 'sqd-transaction-segment',
  templateUrl: './segment.component.html',
  styleUrls: ['./segment.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransactionSegmentComponent {
  @Input() transaction: Transaction;
  @Input() min: number;
  @Input() max: number;
  @Input() level = 1;
  @Input() appId: string;
  @Input() dictChildren: { [key: string]: Array<Transaction> } = {};

  failStatus = TransactionStatus.TRANSACTION_FAILED;

  constructor(private router: Router) {}
  getPosition(): Information {
    if (!this.transaction) {
      return;
    }
    const diffMaxMin = this.max - this.min;
    const leftTime = timeToDate(this.transaction.start_time);
    const rightTime = timeToDate(this.transaction.end_time);
    const left = !diffMaxMin || diffMaxMin <= 0 ? 0 : ((+leftTime - this.min) / diffMaxMin) * 100;
    return {
      left: `${left}%`,
      width:
        !diffMaxMin || diffMaxMin <= 0
          ? '100%'
          : `${Math.min(
              (diffInSec(this.transaction.end_time, this.transaction.start_time) / diffMaxMin) *
                100,
              100 - left,
            )}%`,
      padding: `${(this.level - 1) * 15}px`,
      leftTime,
      rightTime,
    };
  }

  goToPage(id: string) {
    this.router.navigate(['transactions', id]);
  }

  trackByFn(item: Transaction) {
    return item.id;
  }

  goToAppPage(appId: string) {
    this.router.navigate(['applications', appId]);
  }
}
