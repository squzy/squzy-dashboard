import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'sqd-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  title = 'squzy-dashboard';
}
