import {
  Component,
  ChangeDetectionStrategy,
  ViewChild,
  AfterViewInit,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { IncidentListSortBy, IncidentStatus } from 'src/app/shared/enums/incident.type';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortHeader } from '@angular/material/sort';
import { Subject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { QueryParamBuilder, QueryParam } from '@ngqp/core';
import {
  SortDirection,
  angularSortDirectionMap,
  angularSortDirectionReverstMap,
} from 'src/app/shared/enums/sort.table';
import { takeUntil, switchMap } from 'rxjs/operators';
import { IncidentListDataSource } from './datasources/list.datasource';
import { IncidentService } from '../../services/incident.service';
import { MatSelectChange } from '@angular/material/select';
import { timeToDate, Time, diffInSec, SECOND } from 'src/app/shared/date/date';
import { Incident } from 'src/app/shared/interfaces/incident.interfaces';
import { TranslateService } from '@ngx-translate/core';
import { roundNumber } from 'src/app/shared/numbers/numbers';

@Component({
  selector: 'sqd-incident-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListComponent implements AfterViewInit, OnInit, OnDestroy {
  static queryParam = {
    dateTo: 'dateTo',
    dateFrom: 'dateFrom',
    status: 'status',
    sortBy: 'sortBy',
    sortDirection: 'sortDirection',
    page: 'page',
    limit: 'limit',
    ruleId: 'ruleId',
    name: 'name',
  };

  private sortByMap = {
    StartTime: IncidentListSortBy.INCIDENT_LIST_BY_START_TIME,
    EndTime: IncidentListSortBy.INCIDENT_LIST_BY_END_TIME,
  };

  private sortByReverseMap = {
    [IncidentListSortBy.SORT_INCIDENT_LIST_UNSPECIFIED]: null,
    [IncidentListSortBy.INCIDENT_LIST_BY_START_TIME]: 'StartTime',
    [IncidentListSortBy.INCIDENT_LIST_BY_END_TIME]: 'EndTime',
  };

  statuses = [
    IncidentStatus.INCIDENT_STATUS_UNSPECIFIED,
    IncidentStatus.INCIDENT_STATUS_OPENED,
    IncidentStatus.INCIDENT_STATUS_CAN_BE_CLOSED,
    IncidentStatus.INCIDENT_STATUS_CLOSED,
    IncidentStatus.INCIDENT_STATUS_STUDIED,
  ];

  displayedColumns: string[] = ['Id', 'StartTime', 'EndTime', 'Status', 'Duration', 'RuleId'];

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  private destroyed$ = new Subject();

  pageSizes = [5, 10, 20, 100];

  queryFilterGroup = this.qpb.group({
    [ListComponent.queryParam.dateFrom]: this.qpb.param(ListComponent.queryParam.dateFrom, {
      serialize: (value: Date) => (value && value.toISOString()) || null,
      deserialize: (value) => (value ? new Date(value) : null),
    }),
    [ListComponent.queryParam.dateTo]: this.qpb.param(ListComponent.queryParam.dateTo, {
      serialize: (value: Date) => (value && value.toISOString()) || null,
      deserialize: (value) => (value ? new Date(value) : null),
    }),
    [ListComponent.queryParam.status]: this.qpb.numberParam(ListComponent.queryParam.status, {
      emptyOn: IncidentStatus.INCIDENT_STATUS_UNSPECIFIED,
      serialize: (value: IncidentStatus) => `${value}`,
      deserialize: (value) => +value,
    }),
    [ListComponent.queryParam.sortBy]: this.qpb.numberParam(ListComponent.queryParam.sortBy, {
      emptyOn: IncidentListSortBy.SORT_INCIDENT_LIST_UNSPECIFIED,
      serialize: (value: IncidentListSortBy) => `${value}`,
      deserialize: (value) => +value,
    }),
    [ListComponent.queryParam.sortDirection]: this.qpb.numberParam(
      ListComponent.queryParam.sortDirection,
      {
        emptyOn: SortDirection.SORT_DIRECTION_UNSPECIFIED,
        serialize: (value: SortDirection) => `${value}`,
        deserialize: (value) => +value,
      },
    ),
    [ListComponent.queryParam.page]: this.qpb.numberParam(ListComponent.queryParam.page, {
      emptyOn: 0,
      serialize: (value: number) => `${value}`,
      deserialize: (value) => +value,
    }),
    [ListComponent.queryParam.limit]: this.qpb.numberParam(ListComponent.queryParam.limit, {
      emptyOn: this.pageSizes[0],
      serialize: (value: number) => `${value}`,
      deserialize: (value) => +value,
    }),

    [ListComponent.queryParam.ruleId]: this.qpb.stringParam(ListComponent.queryParam.ruleId, {
      emptyOn: '',
      serialize: (value: string) => `${value}`,
      deserialize: (value) => value,
      debounceTime: 300,
    }),
  });

  get status(): QueryParam<number> {
    return this.queryFilterGroup.get(ListComponent.queryParam.status) as QueryParam<number>;
  }

  incidentList$ = this.queryFilterGroup.valueChanges.pipe(takeUntil(this.destroyed$));

  dataSource = new IncidentListDataSource(this.incidentService);

  constructor(
    private router: Router,
    private qpb: QueryParamBuilder,
    private incidentService: IncidentService,
    private translateService: TranslateService,
  ) {}

  ngOnInit() {
    this.sort.sortChange.pipe(takeUntil(this.destroyed$)).subscribe((e) => {
      this.queryFilterGroup.patchValue({
        [ListComponent.queryParam.sortDirection]: angularSortDirectionMap[e.direction],
        [ListComponent.queryParam.sortBy]:
          this.sortByMap[e.active] || IncidentListSortBy.SORT_INCIDENT_LIST_UNSPECIFIED,
      });
    });

    this.paginator.page.pipe(takeUntil(this.destroyed$)).subscribe((e) => {
      this.queryFilterGroup.patchValue({
        [ListComponent.queryParam.limit]: e.pageSize,
        [ListComponent.queryParam.page]: e.pageIndex,
      });
    });

    this.incidentList$
      .pipe(
        switchMap((formValue) =>
          this.dataSource.load(
            formValue[ListComponent.queryParam.dateFrom],
            formValue[ListComponent.queryParam.dateTo],
            formValue[ListComponent.queryParam.limit] || this.pageSizes[0],
            formValue[ListComponent.queryParam.page],

            formValue[ListComponent.queryParam.sortBy],
            formValue[ListComponent.queryParam.sortDirection],
            formValue[ListComponent.queryParam.status],
            {
              ruleId: formValue[ListComponent.queryParam.ruleId],
            },
          ),
        ),
      )
      .subscribe();

    this.dataSource.count$.pipe(takeUntil(this.destroyed$)).subscribe((value) => {
      this.paginator.length = value;
    });
  }

  ngAfterViewInit() {
    const page = this.queryFilterGroup.value[ListComponent.queryParam.page];
    const limit = this.queryFilterGroup.value[ListComponent.queryParam.limit];
    this.paginator.pageIndex = (page || 1) - 1;
    this.paginator.pageSize = limit || this.pageSizes[0];

    const sortBy = this.sortByReverseMap[
      this.queryFilterGroup.value[
        ListComponent.queryParam.sortBy || IncidentListSortBy.SORT_INCIDENT_LIST_UNSPECIFIED
      ]
    ];
    const direction =
      angularSortDirectionReverstMap[
        this.queryFilterGroup.value[
          ListComponent.queryParam.sortDirection || SortDirection.SORT_DIRECTION_UNSPECIFIED
        ]
      ];

    if (
      sortBy &&
      direction &&
      sortBy !== IncidentListSortBy.SORT_INCIDENT_LIST_UNSPECIFIED &&
      direction !== SortDirection.SORT_DIRECTION_UNSPECIFIED
    ) {
      this.sort.active = sortBy;
      this.sort.direction = direction;
      (this.sort.sortables.get(sortBy) as MatSortHeader)._arrowDirection = direction;
      (this.sort.sortables.get(sortBy) as MatSortHeader)._setAnimationTransitionState({
        toState: 'active',
      });
    }
  }

  onStatusChange(event: MatSelectChange) {
    this.status.setValue(event.value);
  }

  toDate(time: Time) {
    return timeToDate(time);
  }

  getStartTime(incident: Incident): Time | false {
    return incident.histories && incident.histories[0] && incident.histories[0].timestamp;
  }

  getEndTime(incident: Incident): Time | false {
    const index = (incident.histories || []).findIndex(
      (item) => item.status === IncidentStatus.INCIDENT_STATUS_CLOSED,
    );
    if (index !== -1) {
      return incident.histories[index].timestamp;
    }
    return false;
  }

  getDuration(incident: Incident) {
    const index = (incident.histories || []).findIndex(
      (e) => e.status === IncidentStatus.INCIDENT_STATUS_CLOSED,
    );
    if (index === -1) {
      return '-';
    }
    return `${roundNumber(
      diffInSec(incident.histories[index].timestamp, incident.histories[0].timestamp) / SECOND,
      3,
    )} ${this.translateService.instant('LABELS.SECOND')}`;
  }

  clickRow(incident: Incident) {
    this.router.navigate(['incidents', incident.id]);
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}
