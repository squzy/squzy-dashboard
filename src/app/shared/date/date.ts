export const SECOND = 1000;
export const MINUTE = SECOND * 60;
export const HOUR = MINUTE * 60;

export const minusSecond = (unixDate: number, seconds: number): Date => {
  return new Date(unixDate - seconds * SECOND);
};

export const minusMinute = (unixDate: number, minutes: number): Date => {
  return new Date(unixDate - minutes * MINUTE);
};

