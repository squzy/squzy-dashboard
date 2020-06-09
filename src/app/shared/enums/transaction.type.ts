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
  Unspecified = 0,
  XHR = 1,
  FETCH = 2,
  WEBSOCKET = 3,
  HTTP = 4,
  GRPC = 5,
  DB = 6,
  INTERNAL = 7,
  ROUTER = 8,
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
