import { Component, ChangeDetectionStrategy, Inject } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { HistoryItem } from '../../../services/checkers.service';

@Component({
  selector: 'sqd-scheduler-snapshot',
  templateUrl: './snapshot.component.html',
  styleUrls: ['./snapshot.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SchedulerSnapshotComponent {
  constructor(@Inject(MAT_BOTTOM_SHEET_DATA) public data: HistoryItem) {}
}
