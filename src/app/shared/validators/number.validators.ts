import { ValidatorFn, FormControl } from '@angular/forms';

export const integerValidator: ValidatorFn = (ctrl: FormControl) => {
  const value = ctrl.value
  return Number.isInteger(ctrl.value) || value === null ? null : {
    notInteger: true
  }
};
