import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { OwnerType } from '../enums/rules.type';

@Injectable()
export class RulesService {
  constructor(private httpClient: HttpClient) {}

  validateRule(ownerType: OwnerType, rule: string) {
    return this.httpClient.post<string>('/api/rule/validate', {
      ownerType,
      rule,
    });
  }

  createRule(
    ownerId: string,
    ownerType: OwnerType,
    rule: string,
    name: string,
    autoClose: boolean,
  ) {
    return this.httpClient.post<string>('/api/rules', {
      ownerId,
      ownerType,
      rule,
      name,
      autoClose,
    });
  }
}
