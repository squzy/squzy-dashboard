export enum Types {
  SCHEDULER_TYPE_UNSPECIFIED = 0,
  TCP = 1,
  GRPC = 2,
  HTTP = 3,
  SITE_MAP = 4,
  HTTP_JSON_VALUE = 5,
  SSL_EXPIRATION = 6,
}

export enum SelectorTypes {
  JSON_PARSE_VALUE_UNSPECIFIED = 0,
  STRING = 1,
  BOOL = 2,
  NUMBER = 3,
  TIME = 4,
  ANY = 5,
  RAW = 6,
}

export enum SortSchedulerList {
  SORT_SCHEDULER_LIST_UNSPECIFIED = 0,
  BY_START_TIME = 1,
  BY_END_TIME = 2,
  BY_LATENCY = 3,
}

export enum SchedulerStatus {
  SCHEDULER_STATUS_UNSPECIFIED = 0,
  RUNNED = 1,
  STOPPED = 2,
  REMOVED = 3,
}

export enum SchedulerResponseCode {
  SCHEDULER_CODE_UNSPECIFIED = 0,
  OK = 1,
  ERROR = 2,
}
