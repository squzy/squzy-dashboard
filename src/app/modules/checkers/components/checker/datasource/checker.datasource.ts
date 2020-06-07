import {
  CheckersService,
  SchedulerResponseCode,
  HistoryItem,
} from '../../../services/checkers.service';
import { DataSource } from '@angular/cdk/table';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { CollectionViewer } from '@angular/cdk/collections';
import { SortSchedulerList, SortDirection } from 'src/app/shared/enums/sort.table';
import { finalize, tap, catchError } from 'rxjs/operators';

export class CheckerDataSource implements DataSource<HistoryItem> {
  private checkersList$ = new BehaviorSubject<HistoryItem[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private countElement$ = new BehaviorSubject<number>(0);

  public loading$ = this.loadingSubject.asObservable();

  public count$ = this.countElement$.asObservable();

  constructor(private checkersService: CheckersService) {}

  connect(collectionViewer: CollectionViewer): Observable<HistoryItem[]> {
    return this.checkersList$.asObservable();
  }

  disconnect(collectionViewer: CollectionViewer): void {
    this.checkersList$.complete();
    this.loadingSubject.complete();
    this.countElement$.complete();
  }

  load(
    id: string,
    dateFrom: Date,
    dateTo: Date,
    limit: number = 20,
    page: number = 1,
    sortBy: SortSchedulerList = SortSchedulerList.SORT_SCHEDULER_LIST_UNSPECIFIED,
    direction: SortDirection = SortDirection.SORT_DIRECTION_UNSPECIFIED,
    status: SchedulerResponseCode = SchedulerResponseCode.UNSPECIFIED,
  ) {
    this.loadingSubject.next(true);
    return this.checkersService
      .getHistory(id, dateFrom, dateTo, limit, page, sortBy, direction, status)
      .pipe(
        catchError((err) => {
          return of({
            count: 0,
            snapshots: [],
          });
        }),
        finalize(() => this.loadingSubject.next(false)),
        tap((data) => {
          this.countElement$.next(data.count);
          this.checkersList$.next(data.snapshots);
        }),
      );
  }
}
