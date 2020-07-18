import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NotificationMethod } from '../interfaces/notifications.interface';
import { OwnerType } from '../enums/rules.type';
import { queryParam, setQueryParams } from '../utils/http.utils';
import { NotificationMethodType } from '../enums/notifications.type';

@Injectable()
export class NotificationsService {
  constructor(private httpClient: HttpClient) {}

  createMethod(req) {
    return this.httpClient.post<NotificationMethod>('/api/v1/notifications', req);
  }

  getList() {
    return this.httpClient.get<Array<NotificationMethod>>('/api/v1/notifications');
  }

  activateById(id: string) {
    return this.httpClient.put<NotificationMethod>(`/api/v1/notifications/${id}/activate`, null);
  }

  deactivateById(id: string) {
    return this.httpClient.put<NotificationMethod>(`/api/v1/notifications/${id}/deactivate`, null);
  }

  deleteById(id: string) {
    return this.httpClient.delete<NotificationMethod>(`/api/v1/notifications/${id}`);
  }

  getMethodsByOwner(ownerType: OwnerType, ownerId: string) {
    return this.httpClient.get<Array<NotificationMethod>>('/api/v1/notifications', {
      params: setQueryParams(queryParam('ownerId', ownerId), queryParam('ownerType', ownerType)),
    });
  }

  linkMethod(ownerType: OwnerType, ownerId: string, methodId: string) {
    return this.httpClient.post<NotificationMethod>(`/api/v1/notifications/${methodId}/link`, {
      ownerId,
      ownerType,
    });
  }

  unLinkMethod(ownerType: OwnerType, ownerId: string, methodId: string) {
    return this.httpClient.post<NotificationMethod>(`/api/v1/notifications/${methodId}/unlink`, {
      ownerId,
      ownerType,
    });
  }
}
