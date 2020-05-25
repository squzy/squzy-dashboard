import { Component, ChangeDetectionStrategy } from '@angular/core';
import { map, switchMap, tap, filter } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { AgentsService } from '../../services/agents.service';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { BehaviorSubject } from 'rxjs';
import { AgentStatus } from 'src/app/shared/enums/agent.type';

@Component({
  selector: 'sqd-agents',
  templateUrl: './agents.component.html',
  styleUrls: ['./agents.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AgentsComponent {
  showDisabled$ = this.agentService.getMenuSettings();

  agents$ = this.showDisabled$.pipe(
    switchMap((value) =>
      this.agentService.getList().pipe(
        map((list) => {
          if (value) {
            return list;
          }
          return list.filter((item) => item.status !== AgentStatus.Unregister);
        }),
      ),
    ),
  );

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

  changeVisibility(event: MatCheckboxChange) {
    this.showDisabled$.next(event.checked);
  }
}
