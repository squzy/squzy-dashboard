import { HttpParams } from '@angular/common/http';

export type queryFn = (params: HttpParams) => HttpParams;

export function queryParam(
  name: string,
  value: string | number,
): (params: HttpParams) => HttpParams {
  return (params: HttpParams) => {
    if (!value) {
      return params;
    }
    return params.set(name, `${value}`);
  };
}

export function setQueryParams(...arr: Array<queryFn>) {
  const httpParam = new HttpParams();
  return arr.reduce((prev, curr) => {
    return curr(prev);
  }, httpParam);
}
