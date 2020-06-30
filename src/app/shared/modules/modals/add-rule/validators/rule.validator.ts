import { AsyncValidator, AbstractControl } from '@angular/forms';
import { of, Subject, timer } from 'rxjs';
import { map, switchMap, filter, catchError, tap, takeUntil } from 'rxjs/operators';
import { RulesService } from 'src/app/shared/services/rules.service';
import { OwnerType } from 'src/app/shared/enums/rules.type';

export class RuleValidator implements AsyncValidator {
  constructor(
    private ownerType: OwnerType,
    private errors$: Subject<string>,
    private rulesService: RulesService,
    private destoryed$: Subject<void>,
  ) {}

  validate(control: AbstractControl) {
    return timer(500).pipe(
      switchMap(() => of(control.value)),
      map((value) => (value ? `${value}`.trim() : null)),
      filter((v) => !!v),
      tap(() => this.errors$.next(null)),
      switchMap((trimmedValue) => this.rulesService.validateRule(this.ownerType, trimmedValue)),
      map((response) => {
        if (response.is_valid) {
          return null;
        }
        this.errors$.next(response.error.message);
        return {
          ruleNotValid: true,
        };
      }),
      takeUntil(this.destoryed$),
    );
  }
}
