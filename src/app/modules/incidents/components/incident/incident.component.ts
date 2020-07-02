import { Component, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { map, takeUntil, switchMap } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { IncidentService } from '../../services/incident.service';
import { Subject } from 'rxjs';

@Component({
  selector: 'sqd-incident',
  templateUrl: './incident.component.html',
  styleUrls: ['./incident.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IncidentComponent implements OnDestroy {
  private destoryed$ = new Subject();

  currentId$ = this.route.params.pipe(
    map((p) => p.id as string),
    takeUntil(this.destoryed$),
  );

  currentIncident$ = this.currentId$.pipe(
    switchMap((id: string) => this.incidentService.getById(id)),
    takeUntil(this.destoryed$),
  );

  constructor(private route: ActivatedRoute, private incidentService: IncidentService) {}

  ngOnDestroy() {
    this.destoryed$.next();
    this.destoryed$.complete();
  }
}
