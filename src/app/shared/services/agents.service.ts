import { Injectable } from '@angular/core';
import { of } from 'rxjs';

const numberOfCpu = 6;
const history = 20;

const example = {
  agentone: {
    id: 'agentone',
    name: 'one',
  },
  agenttwo: {
    id: 'agentone',
    name: 'two',
  },
};

@Injectable({
  providedIn: 'root',
})
export class AgentsService {
  static ALL = 'all';

  static CPU = 'cpu';

  static MEMORY = 'memory';

  static DISK = 'disk';

  static NET = 'net';

  constructor() {}

  // Should return last 20 history
  getCpuStats(agentId: string) {
    return of(
      Array(history)
        .fill(0)
        .map((_, index) => ({
          stats: Array(numberOfCpu)
            .fill(0)
            .map((e) => Math.random()),
          timestamp: Date.now() + index * 1000 * 30,
        })),
    );
  }

  getList() {
    return of(Object.keys(example));
  }

  getTypes() {
    return of([
      AgentsService.ALL,
      AgentsService.CPU,
      AgentsService.DISK,
      AgentsService.MEMORY,
      AgentsService.NET,
    ]);
  }

  getById(id: string) {
    return of(example[id]);
  }
}
