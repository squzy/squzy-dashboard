import { TransactionType, TransactionStatus } from '../enums/transaction.type';
import { Time } from '../date/date';

export interface Transaction {
  id: string;
  application_id: string;
  name: string;
  status: TransactionStatus;
  type: TransactionType;
  start_time: Time;
  end_time: Time;
  meta?: {
    host?: string;
    path?: string;
    method?: string;
  };
  error?: {
    message: string;
  };
}
