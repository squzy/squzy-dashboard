import { Injectable } from '@angular/core';
import { of, BehaviorSubject } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { AgentStatus, AgentStatsTypes } from 'src/app/shared/enums/agent.type';
import { Time } from 'src/app/shared/date/date';
import { setQueryParams, queryParam } from 'src/app/shared/utils/http.utils';

export interface Agent {
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

export interface Cpu {
  load: number;
}

export interface CpusInfo {
  cpu_info: {
    cpus: Array<Cpu>;
  };
}

export interface MemoryWithShared extends Memory {
  shared: number;
}

export interface Timestamp {
  time: Time;
}

export interface Memory {
  free: number;
  total: number;
  used: number;
  used_percent: number;
}

export interface MemoryInfo {
  memory_info: {
    mem: MemoryWithShared;
    swap: Memory;
  };
}

export interface NetInterface {
  bytes_recv: number;
  bytes_sent: number;
  drop_in: number;
  drop_out: number;
  err_out: number;
  err_in: number;
  packets_recv: number;
  packets_sent: number;
}

export interface NetInfo {
  net_info: {
    interfaces: {
      [key: string]: NetInterface;
    };
  };
}

export interface DisksInfo {
  disk_info: {
    disks: {
      [key: string]: Memory;
    };
  };
}

type AllStats = DisksInfo & NetInfo & MemoryInfo & CpusInfo;

export interface Paginated<T> {
  count: number;
  stats: Array<T>;
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

  static USAGE_MEMORY = 'used';

  static TOTAL_MEMORY = 'total';

  static SHARED_MEMORY = 'shared';

  static USED_PERSENT = 'used_percent';

  private showDisabled$ = new BehaviorSubject(false);

  constructor(private httpClient: HttpClient) {}

  getMenuSettings() {
    return this.showDisabled$;
  }

  // Should return last 20 history
  getCpuStats(agentId: string) {
    return this.httpClient
      .get<Paginated<CpusInfo & Timestamp>>(`/api/v1/agents/${agentId}/history`, {
        params: setQueryParams(
          queryParam('type', AgentStatsTypes.CPU),
          queryParam('page', -1),
          queryParam('limit', 50),
        ),
      })
      .pipe(map((v) => v.stats));
  }

  getLiveStat(agentId: string) {
    return this.httpClient
      .get<Paginated<AllStats & Timestamp>>(`/api/v1/agents/${agentId}/history`, {
        params: setQueryParams(
          queryParam('type', AgentStatsTypes.ALL),
          queryParam('page', -1),
          queryParam('limit', 1),
        ),
      })
      .pipe(map((v) => (v.stats && v.stats.length === 1 && v.stats[0]) || null));
  }

  getMemoryStats(agentId: string) {
    return this.httpClient
      .get<Paginated<MemoryInfo & Timestamp>>(`/api/v1/agents/${agentId}/history`, {
        params: setQueryParams(
          queryParam('type', AgentStatsTypes.MEMORY),
          queryParam('page', -1),
          queryParam('limit', 50),
        ),
      })
      .pipe(map((v) => v.stats));
  }

  getDisksStats(agentId: string) {
    return this.httpClient
      .get<Paginated<DisksInfo & Timestamp>>(`/api/v1/agents/${agentId}/history`, {
        params: setQueryParams(
          queryParam('type', AgentStatsTypes.DISK),
          queryParam('page', -1),
          queryParam('limit', 50),
        ),
      })
      .pipe(map((v) => v.stats));
  }

  getNetStats(agentId: string) {
    return this.httpClient
      .get<Paginated<NetInfo & Timestamp>>(`/api/v1/agents/${agentId}/history`, {
        params: setQueryParams(
          queryParam('type', AgentStatsTypes.NET),
          queryParam('page', -1),
          queryParam('limit', 50),
        ),
      })
      .pipe(map((v) => v.stats));
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
