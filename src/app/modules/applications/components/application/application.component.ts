import { Component, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map, switchMap, takeUntil } from 'rxjs/operators';
import { ApplicationsService } from '../../services/applications.service';
import { ApplicationStatus } from 'src/app/shared/enums/application.type';
import { Subject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { OwnerType } from 'src/app/shared/enums/rules.type';

@Component({
  selector: 'sqd-application',
  templateUrl: './application.component.html',
  styleUrls: ['./application.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApplicationComponent implements OnDestroy {
  private destoryed$ = new Subject();

  currentId$ = this.route.params.pipe(
    map((p) => p.id as string),
    takeUntil(this.destoryed$),
  );

  currentApplication$ = this.currentId$.pipe(
    switchMap((id: string) => this.applicationService.getById(id)),
    takeUntil(this.destoryed$),
  );

  navLinks = [
    {
      path: './list',
      label: 'MODULES.APPLICATIONS.MENU.LIST',
    },
    {
      path: './overview',
      label: 'MODULES.APPLICATIONS.MENU.OVERVIEW',
    },
  ];

  APPLICATION_TYPE = OwnerType.INCIDENT_OWNER_TYPE_APPLICATION;

  constructor(private route: ActivatedRoute, private applicationService: ApplicationsService) {}

  ngOnDestroy() {
    this.destoryed$.next();
    this.destoryed$.complete();
  }
}
