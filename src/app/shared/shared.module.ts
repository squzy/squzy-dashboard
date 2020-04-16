import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgentsService } from './services/agents.service';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  imports: [CommonModule, HttpClientModule],
  declarations: [],
  providers: [AgentsService],
  exports: [],
})
export class SharedModule {}
