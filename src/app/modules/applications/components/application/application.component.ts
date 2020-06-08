import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs/operators';

@Component({
  selector: 'sqd-application',
  templateUrl: './application.component.html',
  styleUrls: ['./application.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApplicationComponent {
  currentId$ = this.route.params.pipe(map((p) => p.id as string));

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

  constructor(private route: ActivatedRoute) {}
}
