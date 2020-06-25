import { Component, ChangeDetectionStrategy, Inject, OnDestroy } from '@angular/core';
import { OwnerType } from 'src/app/shared/enums/rules.type';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, Validators } from '@angular/forms';
import { RuleValidator } from '../validators/rule.validator';
import { Subject } from 'rxjs';
import { RulesService } from 'src/app/shared/services/rules.service';
import { takeUntil } from 'rxjs/operators';

export interface AddRuleData {
  ownerType: OwnerType;
  ownerId: string;
}

@Component({
  selector: 'sqd-dialog-add-rule',
  templateUrl: './add-rule.component.html',
  styleUrls: ['./add-rule.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddRuleFormComponent implements OnDestroy {
  private destroyed$ = new Subject<void>();

  private ruleValidationErrMsg = new Subject<string>();

  validationErrors$ = this.ruleValidationErrMsg.asObservable();

  form = this.fb.group({
    name: ['', Validators.compose([Validators.required])],
    rule: [
      '',
      {
        validators: Validators.compose([Validators.required]),
        asyncValidators: [
          new RuleValidator(
            this.data.ownerType,
            this.ruleValidationErrMsg,
            this.rulesService,
            this.destroyed$,
          ),
        ],
      },
    ],
    autoClose: [false],
  });

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: AddRuleData,
    private dialogRef: MatDialogRef<AddRuleFormComponent>,
    private fb: FormBuilder,
    private rulesService: RulesService,
  ) {}

  onSubmit() {
    const { rule, name, autoClose } = this.form.value;
    this.rulesService
      .createRule(this.data.ownerId, this.data.ownerType, rule, name, autoClose)
      .pipe(takeUntil(this.destroyed$))
      .subscribe((res) => {
        this.dialogRef.close(res);
      });
  }

  ngOnDestroy() {
    this.destroyed$.next();
  }
}
