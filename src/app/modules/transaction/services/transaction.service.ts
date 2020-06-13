import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Transaction } from 'src/app/shared/interfaces/transaction.interfaces';

export interface Children<T> {
  children?: Array<T>;
}

type TransactionWithChildren = Transaction & Children<Transaction>;

@Injectable()
export class TransactionService {
  constructor(private httpClient: HttpClient) {}

  getTransactionById(transaction_id: string) {
    return this.httpClient.get<TransactionWithChildren>(`/api/v1/transaction/${transaction_id}`);
  }
}
