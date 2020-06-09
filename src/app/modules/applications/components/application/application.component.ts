import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map, switchMap } from 'rxjs/operators';
import { ApplicationsService } from '../../services/applications.service';
import { ApplicationStatus, statusToString } from 'src/app/shared/enums/application.type';

@Component({
  selector: 'sqd-application',
  templateUrl: './application.component.html',
  styleUrls: ['./application.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApplicationComponent {
  currentId$ = this.route.params.pipe(map((p) => p.id as string));

  currentApplication$ = this.currentId$.pipe(
    switchMap((id: string) => this.applicationService.getById(id)),
  );

  navLinks = [
    {
      path: './list',
      label: 'List',
    },
    {
      path: './overview',
      label: 'Overview',
    },
  ];

  constructor(private route: ActivatedRoute, private applicationService: ApplicationsService) {}

  toStatus(status: ApplicationStatus) {
    return statusToString(status);
  }
}
