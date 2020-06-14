import {
  Component,
  ChangeDetectionStrategy,
  OnDestroy,
  OnInit,
  ChangeDetectorRef,
} from '@angular/core';
import { TransactionService } from '../services/transaction.service';
import { ActivatedRoute, Router } from '@angular/router';
import { map, switchMap, tap, takeUntil } from 'rxjs/operators';
import { Transaction } from 'src/app/shared/interfaces/transaction.interfaces';
import { Subject } from 'rxjs';
import { timeToDate, Time } from 'src/app/shared/date/date';
import {
  TransactionStatus,
  statusToString,
  typeToString,
  TransactionType,
} from 'src/app/shared/enums/transaction.type';

@Component({
  selector: 'sqd-transactions',
  templateUrl: './transaction.component.html',
  styleUrls: ['./transaction.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransactionComponent implements OnInit, OnDestroy {
  private destroyed$ = new Subject();
  root: Transaction;
  min: number;
  max: number;

  dictChildren: { [key: string]: Array<Transaction> } = {};

  private transactions$ = this.route.params.pipe(
    map((p) => p.id as string),
    tap(() => {
      this.dictChildren = {};
      this.root = null;
      this.max = null;
      this.min = null;
    }),
    switchMap((id) => this.transactionService.getTransactionById(id)),
    tap((res) => {
      this.root = res.transaction;
      this.min = +timeToDate(this.root.start_time);
      this.max = +timeToDate(this.root.end_time);
      (res.children || []).forEach((child) => {
        const parentId = child.parent_id;
        if (!parentId) {
          return;
        }
        if (!this.dictChildren[parentId]) {
          this.dictChildren[parentId] = [];
        }
        this.dictChildren[parentId].push(child);
      });
      this.cdr.markForCheck();
    }),
    takeUntil(this.destroyed$),
  );

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private transactionService: TransactionService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.transactions$.subscribe();
  }

  toStatus(status: TransactionStatus) {
    return statusToString(status);
  }

  toType(type: TransactionType) {
    return typeToString(type);
  }

  timeToDate(time: Time): Date {
    return timeToDate(time);
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  goToPage(id: string) {
    this.router.navigate(['transactions', id]);
  }

  goToApplication(id: string) {
    this.router.navigate(['applications', id]);
  }
}
