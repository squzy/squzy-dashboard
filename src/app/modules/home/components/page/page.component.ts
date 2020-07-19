import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';

interface MenuItem {
  title: string;
  icon: string;
  description: string;
  path: string;
  faqLink?: string;
}

@Component({
  selector: 'sqd-home-page',
  templateUrl: './page.component.html',
  styleUrls: ['./page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePageComponent {
  menu: Array<MenuItem> = [
    {
      title: 'MODULES.HOME.PAGE.AGENTS_TITLE',
      icon: 'android',
      description: 'MODULES.HOME.PAGE.AGENTS_DESCRIPTION',
      path: 'agents',
    },
    {
      title: 'MODULES.HOME.PAGE.CHECKERS_TITLE',
      icon: 'check',
      description: 'MODULES.HOME.PAGE.CHECKERS_DESCRIPTION',
      path: 'checkers',
    },
    {
      title: 'MODULES.HOME.PAGE.APPLICATION_TITLE',
      icon: 'view_list',
      description: 'MODULES.HOME.PAGE.APPLICATION_DESCRIPTION',
      path: 'applications',
    },
    {
      title: 'MODULES.HOME.PAGE.INCIDENTS_TITLE',
      icon: 'error',
      description: 'MODULES.HOME.PAGE.INCIDENTS_DESCRIPTION',
      path: 'incidents',
    },
    {
      title: 'MODULES.HOME.PAGE.NOTIFICATIONS_TITLE',
      icon: 'notification_important',
      description: 'MODULES.HOME.PAGE.NOTIFICATIONS_DESCRIPTION',
      path: 'notification-methods',
    },
  ];

  constructor(private router: Router) {}

  goToLink(path: string) {
    this.router.navigate([path]);
  }
}
