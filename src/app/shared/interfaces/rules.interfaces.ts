import { OwnerType, RuleStatus } from '../enums/rules.type';

export interface Rule {
  id: string;
  rule: string;
  name: string;
  auto_close: boolean;
  status: RuleStatus;
  owner_type: OwnerType;
  owner_id: string;
}
