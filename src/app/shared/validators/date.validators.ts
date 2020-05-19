import { ValidatorFn, FormGroup } from '@angular/forms';

export const dateFromToValidator: ValidatorFn = (fg: FormGroup) => {
  const dateFrom = +fg.get('dateFrom').value;
  const dateTo = +fg.get('dateTo').value;
  return dateTo < dateFrom
    ? {
        dateToLessThenFrom: true,
      }
    : null;
};
