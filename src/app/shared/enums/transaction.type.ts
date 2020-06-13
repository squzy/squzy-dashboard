export enum TransactionGroup {
  Unspecified = 0,
  Type = 1,
  Name = 2,
  Method = 3,
  Host = 4,
  Path = 5,
}

export enum TransactionStatus {
  Unspecified = 0,
  Successfull = 1,
  Failed = 2,
}

export enum TransactionType {
  TRANSACTION_TYPE_UNSPECIFIED = 0,
  TRANSACTION_TYPE_XHR = 1,
  TRANSACTION_TYPE_FETCH = 2,
  TRANSACTION_TYPE_WEBSOCKET = 3,
  TRANSACTION_TYPE_HTTP = 4,
  TRANSACTION_TYPE_GRPC = 5,
  TRANSACTION_TYPE_DB = 6,
  TRANSACTION_TYPE_INTERNAL = 7,
  TRANSACTION_TYPE_ROUTER = 8,
}

export const TransactionTypes = [
  TransactionType.TRANSACTION_TYPE_UNSPECIFIED,
  TransactionType.TRANSACTION_TYPE_XHR,
  TransactionType.TRANSACTION_TYPE_DB,
  TransactionType.TRANSACTION_TYPE_FETCH,
  TransactionType.TRANSACTION_TYPE_GRPC,
  TransactionType.TRANSACTION_TYPE_HTTP,
  TransactionType.TRANSACTION_TYPE_INTERNAL,
  TransactionType.TRANSACTION_TYPE_ROUTER,
  TransactionType.TRANSACTION_TYPE_WEBSOCKET,
];

export enum TransactionListSortBy {
  SORT_TRANSACTION_LIST_UNSPECIFIED = 0,
  DURATION = 1,
  BY_TRANSACTION_START_TIME = 2,
  BY_TRANSACTION_END_TIME = 3,
}

export function typeToString(type: TransactionType) {
  return TransactionType[type];
}

export function statusToString(status: TransactionStatus) {
  return TransactionStatus[status];
}

export function groupTypesToString(group: TransactionGroup) {
  return TransactionGroup[group];
}
