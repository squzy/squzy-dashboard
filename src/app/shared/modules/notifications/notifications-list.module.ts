import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';
import { NotificationListComponent } from './components/list/list.component';

@NgModule({
  imports: [
    CommonModule,
    MatListModule,
    MatTooltipModule,
    MatIconModule,
    MatButtonModule,
    TranslateModule.forChild({}),
  ],
  declarations: [NotificationListComponent],
  exports: [NotificationListComponent],
})
export class NotificationListModule {}
