import { CpuStatsComponent } from './components/cpu-stat/cpu-stats.component';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ChartsModule } from 'ng2-charts';

@NgModule({
  imports: [CommonModule, ChartsModule],
  declarations: [CpuStatsComponent],
  exports: [CpuStatsComponent],
})
export class StatsModule {}
