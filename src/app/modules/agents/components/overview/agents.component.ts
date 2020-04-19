import { Component } from '@angular/core';
import { AgentsService } from 'src/app/shared/services/agents.service';
import { map, switchMap, tap, filter } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'sqd-agents',
  templateUrl: './agents.component.html',
  styleUrls: ['./agents.component.scss'],
})
export class AgentsComponent {
  agents$ = this.agentService.getList();

  types$ = this.agentService.getTypes();

  currentId$ = this.route.params.pipe(map((p) => p.id));

  currentType$ = this.route.params.pipe(
    map((v) => v.type),
    filter((v) => !!v),
  );

  CPU_TYPE = AgentsService.CPU;
  MEMORY_TYPE = AgentsService.MEMORY;
  DISK_TYPE = AgentsService.DISK;
  NET_TYPE = AgentsService.NET;

  currentAgent$ = this.currentId$.pipe(switchMap((id: string) => this.agentService.getById(id)));

  iconByType = {
    [AgentsService.ALL]: 'devices_other',
    [AgentsService.MEMORY]: 'memory',
    [AgentsService.NET]: 'signal_cellular_alt',
    [AgentsService.DISK]: 'storage',
    [AgentsService.CPU]: 'laptop',
  };

  constructor(private agentService: AgentsService, private route: ActivatedRoute) {}
}
