export const SECOND = 1000;
export const MINUTE = SECOND * 60;
export const HOUR = MINUTE * 60;
export const MS_TO_NANOS = 1000000;

export interface Time {
  seconds: number;
  nanos: number;
}

export const minusSecond = (unixDate: number, seconds: number): Date => {
  return new Date(unixDate - seconds * SECOND);
};

export const minusMinute = (unixDate: number, minutes: number): Date => {
  return new Date(unixDate - minutes * MINUTE);
};

export function timeToDate(time: Time): Date {
  return new Date(time.seconds * 1000 + Math.round(time.nanos / MS_TO_NANOS));
}

export function diffInSec(timeA: Time, timeB: Time): number {
  return (
    timeA.seconds * 1000 -
    timeB.seconds * 1000 +
    Math.round((timeA.nanos - timeB.nanos) / MS_TO_NANOS)
  );
}
