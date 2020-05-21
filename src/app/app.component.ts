import { Component, ChangeDetectionStrategy } from '@angular/core';
import { AppService } from './shared/services/app.service';

@Component({
  selector: 'sqd-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  version$ = this.appService.getVersion();

  constructor(private appService: AppService) {}
}
