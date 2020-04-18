import { CpuStatsComponent } from './components/cpu-stat/cpu-stats.component';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ChartsModule } from 'ng2-charts';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MemoryStatComponent } from './components/memory-stat/memory-stat.component';
import { DisksStatComponent } from './components/disks-stat/disks-stat.component';

@NgModule({
  imports: [CommonModule, ChartsModule, MatCardModule, MatGridListModule],
  declarations: [CpuStatsComponent, MemoryStatComponent, DisksStatComponent],
  exports: [CpuStatsComponent, MemoryStatComponent, DisksStatComponent],
})
export class StatsModule {}
