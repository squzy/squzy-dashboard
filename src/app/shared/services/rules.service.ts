import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { OwnerType } from '../enums/rules.type';
import { Rule } from '../interfaces/rules.interfaces';
import { setQueryParams, queryParam } from '../utils/http.utils';

@Injectable()
export class RulesService {
  constructor(private httpClient: HttpClient) {}

  validateRule(ownerType: OwnerType, rule: string) {
    return this.httpClient.post<boolean>('/api/rule/validate', {
      ownerType,
      rule,
    });
  }

  getRulesByOwnerId(ownerId: string, ownerType: OwnerType) {
    return this.httpClient.get<Array<Rule>>(`/api/v1/rules`, {
      params: setQueryParams(queryParam('ownerType', ownerType), queryParam('ownerId', ownerId)),
    });
  }

  activate(ruleId: string) {
    return this.httpClient.put<Rule>(`/api/v1/rules/${ruleId}/activate`, {});
  }

  getById(ruleId: string) {
    return this.httpClient.get<Rule>(`/api/v1/rules/${ruleId}`);
  }

  remove(ruleId: string) {
    return this.httpClient.delete<Rule>(`/api/v1/rules/${ruleId}`);
  }

  deactivate(ruleId: string) {
    return this.httpClient.put<Rule>(`/api/v1/rules/${ruleId}/deactivate`, {});
  }

  createRule(
    ownerId: string,
    ownerType: OwnerType,
    rule: string,
    name: string,
    autoClose: boolean,
  ) {
    return this.httpClient.post<Rule>('/api/v1/rules', {
      ownerId,
      ownerType,
      rule,
      name,
      autoClose,
    });
  }
}
