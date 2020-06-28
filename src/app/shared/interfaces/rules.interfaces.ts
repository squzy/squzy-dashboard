import { OwnerType, RuleStatus } from '../enums/rules.type';

export interface Rule {
  id: string;
  rule: string;
  name: string;
  auto_close: boolean;
  status: RuleStatus;
  ownerType: OwnerType;
  ownerId: string;
}
