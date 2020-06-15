import { Component, ChangeDetectionStrategy } from '@angular/core';
import { AppService } from './shared/services/app.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'sqd-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  version$ = this.appService.getVersion();

  links = [
    {
      path: '/agents',
      text: 'MENU.AGENTS',
    },
    {
      path: '/checkers',
      text: 'MENU.CHECKERS',
    },
    {
      path: 'applications',
      text: 'MENU.APPLICATIONS',
    },
  ];

  constructor(private appService: AppService) {}
}
