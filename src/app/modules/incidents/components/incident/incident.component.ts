import { Component, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { map, takeUntil, switchMap, startWith, share, refCount, shareReplay } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { IncidentService } from '../../services/incident.service';
import { Subject, combineLatest } from 'rxjs';
import { IncidentStatus } from 'src/app/shared/enums/incident.type';
import { RulesService } from 'src/app/shared/services/rules.service';
import { OwnerType } from 'src/app/shared/enums/rules.type';
import { Time, timeToDate } from 'src/app/shared/date/date';

@Component({
  selector: 'sqd-incident',
  templateUrl: './incident.component.html',
  styleUrls: ['./incident.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IncidentComponent implements OnDestroy {
  private destoryed$ = new Subject();
  private refresh$ = new Subject();

  currentId$ = this.route.params.pipe(
    map((p) => p.id as string),
    takeUntil(this.destoryed$),
  );

  currentIncident$ = combineLatest(this.currentId$, this.refresh$.pipe(startWith(null))).pipe(
    switchMap(([id, _]) => this.incidentService.getById(id)),
    shareReplay(),
    takeUntil(this.destoryed$),
  );

  currentRule$ = this.currentIncident$.pipe(
    switchMap((incident) => this.rulesService.getById(incident.rule_id)),
    takeUntil(this.destoryed$),
  );

  OPENED = IncidentStatus.INCIDENT_STATUS_OPENED;
  CLOSED = IncidentStatus.INCIDENT_STATUS_CLOSED;

  constructor(
    private route: ActivatedRoute,
    private incidentService: IncidentService,
    private rulesService: RulesService,
    private router: Router,
  ) {}

  close(id: string) {
    this.incidentService
      .close(id)
      .pipe(takeUntil(this.destoryed$))
      .subscribe(() => {
        this.refresh$.next(null);
      });
  }

  study(id: string) {
    this.incidentService
      .study(id)
      .pipe(takeUntil(this.destoryed$))
      .subscribe(() => {
        this.refresh$.next(null);
      });
  }

  goToRulePage(ownerType: OwnerType, ownerId: string) {
    switch (ownerType) {
      case OwnerType.INCIDENT_OWNER_TYPE_AGENT:
        this.router.navigate(['agents', ownerId]);
        break;
      case OwnerType.INCIDENT_OWNER_TYPE_SCHEDULER:
        this.router.navigate(['checkers', ownerId]);
        break;
      case OwnerType.INCIDENT_OWNER_TYPE_APPLICATION:
        this.router.navigate(['applications', ownerId]);
        break;
    }
  }
  toDate(time: Time) {
    return timeToDate(time);
  }

  ngOnDestroy() {
    this.destoryed$.next();
    this.destoryed$.complete();
  }
}
