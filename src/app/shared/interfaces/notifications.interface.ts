import { NotificationMethodStatuses, NotificationMethodType } from '../enums/notifications.type';

export interface NotificationMethod {
  id: string;
  name: string;
  status: NotificationMethodStatuses;
  type: NotificationMethodType;
  Method: {
    slack?: {
      url: string;
    };
    webhook?: {
      url: string;
    };
  };
}
