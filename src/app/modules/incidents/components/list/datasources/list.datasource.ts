import { Incident } from 'src/app/shared/interfaces/incident.interfaces';
import { IncidentService } from '../../../services/incident.service';
import { DataSource } from '@angular/cdk/table';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { CollectionViewer } from '@angular/cdk/collections';
import { IncidentListSortBy, IncidentStatus } from 'src/app/shared/enums/incident.type';
import { SortDirection } from 'src/app/shared/enums/sort.table';
import { catchError, finalize, tap } from 'rxjs/operators';

export interface Filters {
  ruleId?: string;
}

export class IncidentListDataSource implements DataSource<Incident> {
  private incidentList$ = new BehaviorSubject<Incident[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private countElement$ = new BehaviorSubject<number>(0);

  public loading$ = this.loadingSubject.asObservable();

  public count$ = this.countElement$.asObservable();

  constructor(private incidentService: IncidentService) {}

  connect(collectionViewer: CollectionViewer): Observable<Incident[]> {
    return this.incidentList$.asObservable();
  }

  disconnect(collectionViewer: CollectionViewer): void {
    this.incidentList$.complete();
    this.loadingSubject.complete();
    this.countElement$.complete();
  }

  load(
    from: Date,
    to: Date,
    limit: number = 20,
    page: number = 0,
    sortBy: IncidentListSortBy = IncidentListSortBy.SORT_INCIDENT_LIST_UNSPECIFIED,
    direction: SortDirection = SortDirection.SORT_DIRECTION_UNSPECIFIED,
    status: IncidentStatus = IncidentStatus.INCIDENT_STATUS_UNSPECIFIED,
    filters?: Filters,
  ) {
    this.loadingSubject.next(true);
    return this.incidentService
      .getList(from, to, limit, page, sortBy, direction, status, filters.ruleId)
      .pipe(
        catchError((err) => {
          return of({
            count: 0,
            incidents: [],
          });
        }),
        finalize(() => this.loadingSubject.next(false)),
        tap((data) => {
          this.countElement$.next(data.count);
          this.incidentList$.next(data.incidents);
        }),
      );
  }
}
