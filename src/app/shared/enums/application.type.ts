export enum ApplicationStatus {
  Unspecified = 0,
  Enabled = 1,
  Disabled = 2,
  Archived = 3,
}

export function statusToString(type: ApplicationStatus) {
  return ApplicationStatus[type];
}
