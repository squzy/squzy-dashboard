export enum SortSchedulerList {
  SORT_SCHEDULER_LIST_UNSPECIFIED = 0,
  BY_START_TIME = 1,
  BY_END_TIME = 2,
  BY_LATENCY = 3,
}

export enum SortDirection {
  SORT_DIRECTION_UNSPECIFIED = 0,
  ASC = 1,
  DESC = 2,
}

export const angularSortDirectionMap = {
  '': SortDirection.SORT_DIRECTION_UNSPECIFIED,
  asc: SortDirection.ASC,
  desc: SortDirection.DESC,
};

export const angularSortDirectionReverstMap = {
  [SortDirection.SORT_DIRECTION_UNSPECIFIED]: '',
  [SortDirection.ASC]: 'asc',
  [SortDirection.DESC]: 'desc',
};
