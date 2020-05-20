import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { tap, map } from 'rxjs/operators';

const numberOfCpu = 10;
const history = 20;

const netInterfaceMock = () => ({
  bytesSent: Math.round(Math.random() * 10000),
  bytesRecv: Math.round(Math.random() * 10000),
  packetsSent: Math.round(Math.random() * 10000),
  packetsRecv: Math.round(Math.random() * 10000),
  errIn: Math.round(Math.random() * 100),
  errOut: Math.round(Math.random() * 100),
  dropIn: Math.round(Math.random() * 1000),
  dropOut: Math.round(Math.random() * 1000),
});

const netInterfacesMock = () => ({
  wlan: netInterfaceMock(),
  wlan0: netInterfaceMock(),
});

const memoryMock = () => {
  const total = 1000;
  const used = Math.random() * 500;

  const free = total - used;
  const shared = Math.random() * 100;
  const usedPercent = used / total;
  return {
    [AgentsService.TOTAL_MEMORY]: total,
    [AgentsService.USAGE_MEMORY]: used,
    [AgentsService.FREE_MEMORY]: free,
    [AgentsService.SHARED_MEMORY]: shared,
    [AgentsService.USED_PERSENT]: usedPercent,
  };
};

const disksMock = () => ({
  '/': memoryMock(),
  '/dev': memoryMock(),
});

const cpuMock = () => Math.random();

const cpusMock = () =>
  Array(numberOfCpu)
    .fill(0)
    .map((e) => cpuMock());

const memoriesMock = () => ({
  [AgentsService.SWAP_MEMORY]: memoryMock(),
  [AgentsService.VIRTUAL_MEMORY]: memoryMock(),
});

export enum AgentStatus {
  Registred = 1,
  Runned = 2,
  Disconnected = 3,
  Unregister = 4,
}

interface Agent {
  id: string;
  agent_name?: string;
  status: AgentStatus;
  host_info?: {
    host_name: string;
    os: string;
    platform_info?: {
      name: string;
      family: string;
      version: string;
    };
  };
}

@Injectable({
  providedIn: 'root',
})
export class AgentsService {
  static LIVE = 'live';

  static CPU = 'cpu';

  static MEMORY = 'memory';

  static DISK = 'disk';

  static NET = 'net';

  static VIRTUAL_MEMORY = 'mem';

  static SWAP_MEMORY = 'swap';

  static FREE_MEMORY = 'free';

  static USAGE_MEMORY = 'usage';

  static TOTAL_MEMORY = 'total';

  static SHARED_MEMORY = 'shared';

  static USED_PERSENT = 'usedPercent';

  constructor(private httpClient: HttpClient) {}

  // Should return last 20 history
  getCpuStats(agentId: string) {
    return this.httpClient
      .get(`/api/v1/agents/${agentId}/history?type=2&page=-1&limit=20`)
      .pipe(map((v: any) => v.stats));
  }

  getLiveStat(agentId: string) {
    return this.httpClient
      .get(`/api/v1/agents/${agentId}/history?type=1&page=-1&limit=1`)
      .pipe(map((v: any) => v.stats[0]));
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

  getNetStats(agentId: string) {
    return of(
      Array(history)
        .fill(0)
        .map((_, index) => ({
          netStats: netInterfacesMock(),
          timestamp: Date.now() + index * 1000 * 30,
        })),
    );
  }

  getList() {
    return this.httpClient.get<Array<Agent>>('/api/v1/agents').pipe(map((e) => e || []));
  }

  getTypes() {
    return of([
      AgentsService.LIVE,
      AgentsService.CPU,
      AgentsService.DISK,
      AgentsService.MEMORY,
      AgentsService.NET,
    ]);
  }

  getById(id: string) {
    return this.httpClient.get<Agent>(`/api/v1/agents/${id}`);
  }

  statusToString(status: AgentStatus) {
    return AgentStatus[status];
  }
}
