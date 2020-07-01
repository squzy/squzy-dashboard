import { IncidentStatus } from '../enums/incident.type';
import { Time } from '../date/date';

export interface Incident {
  id: string;
  status: IncidentStatus;
  rule_id: string;
  histories: Array<IncidentHistoryItem>;
}

export interface IncidentHistoryItem {
  status: IncidentStatus;
  timestamp: Time;
}
