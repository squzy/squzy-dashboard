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

const memoryMock = () => {
  const total = 1000;
  const used = Math.random() * 500;

  const free = total - used;
  const shared = Math.random() * 100;
  const usedPercent = used / total;
  return {
    total,
    used,
    free,
    shared,
    usedPercent,
  };
};

const disksMock = () => ({
  '/': memoryMock(),
  '/dev': memoryMock(),
});

const memoriesMock = () => ({
  [AgentsService.SWAP_MEMORY]: memoryMock(),
  [AgentsService.VIRTUAL_MEMORY]: memoryMock(),
});

@Injectable({
  providedIn: 'root',
})
export class AgentsService {
  static ALL = 'all';

  static CPU = 'cpu';

  static MEMORY = 'memory';

  static DISK = 'disk';

  static NET = 'net';

  static VIRTUAL_MEMORY = 'virtual';

  static SWAP_MEMORY = 'swap';

  static FREE_MEMORY = 'free';

  static USAGE_MEMORY = 'usage';

  static TOTAL_MEMORY = 'total';

  static SHARED_MEMORY = 'shared';

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

  getMemoryStats(agentId: string) {
    return of(
      Array(history)
        .fill(0)
        .map((_, index) => ({
          memoryStats: memoriesMock(),
          timestamp: Date.now() + index * 1000 * 30,
        })),
    );
  }

  getDisksStats(agentId: string) {
    return of(
      Array(history)
        .fill(0)
        .map((_, index) => ({
          disksStats: disksMock(),
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
