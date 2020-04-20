import { Component } from '@angular/core';
import { map, switchMap, tap, filter } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { AgentsService } from '../../services/agents.service';

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

  LIVE_TYPE = AgentsService.LIVE;
  CPU_TYPE = AgentsService.CPU;
  MEMORY_TYPE = AgentsService.MEMORY;
  DISK_TYPE = AgentsService.DISK;
  NET_TYPE = AgentsService.NET;

  currentAgent$ = this.currentId$.pipe(switchMap((id: string) => this.agentService.getById(id)));

  iconByType = {
    [AgentsService.LIVE]: 'live_tv',
    [AgentsService.MEMORY]: 'memory',
    [AgentsService.NET]: 'signal_cellular_alt',
    [AgentsService.DISK]: 'storage',
    [AgentsService.CPU]: 'laptop',
  };

  constructor(private agentService: AgentsService, private route: ActivatedRoute) {}
}
