import { Component, ChangeDetectionStrategy, Inject } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { Scheduler } from '../../../services/checkers.service';

@Component({
  selector: 'sqd-scheduler-config',
  templateUrl: './config.component.html',
  styleUrls: ['./config.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SchedulerConfigComponent {
  constructor(@Inject(MAT_BOTTOM_SHEET_DATA) public data: Scheduler) {}
}
