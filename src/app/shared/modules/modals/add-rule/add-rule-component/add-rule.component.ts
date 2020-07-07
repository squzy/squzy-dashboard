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

interface Example {
  description: string;
  value: string;
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

  examples: { [key: string]: Array<Example> } = {
    [`${OwnerType.INCIDENT_OWNER_TYPE_SCHEDULER}`]: [
      {
        description: 'MODULES.MODALS.ADD_RULE.EXAMPLE_SCHEDULER_LAST_TWO',
        value: 'all(map(Last(2), {.Code}), { # == Error })',
      },
      {
        description: 'MODULES.MODALS.ADD_RULE.EXAMPLE_SCHEDULER_LAST_TWO_STRICT',
        value: 'len(filter(map(Last(2), {.Code}), { # == Error })) == 2',
      },
      {
        description: 'MODULES.MODALS.ADD_RULE.EXAMPLE_SCHEDULER_LAST_SIX',
        value: 'count(map(Last(6), {.Code}), { # == Error}) > 3',
      },
      {
        description: 'MODULES.MODALS.ADD_RULE.EXAMPLE_SCHEDULER_DURATION',
        value: 'any(map(Last(2), { Duration(#)}), { # > 30 })',
      },
    ],
    [`${OwnerType.INCIDENT_OWNER_TYPE_AGENT}`]: [
      {
        description: 'MODULES.MODALS.ADD_RULE.EXAMPLE_AGENT_CPU_LOAD',
        value: 'any(Last(3, UseType(CPU)), {any(.CpuInfo.Cpus, {.Load > 10})})',
      },
      {
        description: 'MODULES.MODALS.ADD_RULE.EXAMPLE_AGENT_CPU_LOAD_STRICT',
        value:
          'len(filter(map(Last(3, UseType(CPU)), {all(.CpuInfo.Cpus, {.Load > 10})}), { # == true })) == 3',
      },
      {
        value: 'any(map(Last(1, UseType(Memory)), {.MemoryInfo.Mem.UsedPercent}), { # > 50})',
        description: 'MODULES.MODALS.ADD_RULE.EXAMPLE_AGENT_MEMORY_LOAD',
      },
      {
        value:
          'any(Last(1, UseType(Disk)), {.DiskInfo.Disks["/System/Volumes/Data"].UsedPercent}), { # > 50})',
        description: 'MODULES.MODALS.ADD_RULE.EXAMPLE_AGENT_DISK_LOAD',
      },
      {
        value:
          'any(Last(1, UseType(Disk)), {.DiskInfo.Disks["/System/Volumes/Data"].UsedPercent > 50})',
        description: 'MODULES.MODALS.ADD_RULE.EXAMPLE_AGENT_DISK_LOAD',
      },
    ],
    [`${OwnerType.INCIDENT_OWNER_TYPE_APPLICATION}`]: [
      {
        description: 'MODULES.MODALS.ADD_RULE.EXAMPLE_APPLICATION_FAILED_TRANSACTION',
        value: 'all(map(Last(2, UseName(\'/times\')), {.Status}), { # == Failed})',
      },
      {
        value:
          'all(map(Last(2, UseMethod(\'GET\'), UseName(\'/times\')), { Duration(#)}), { # > 3000})',
        description: 'MODULES.MODALS.ADD_RULE.EXAMPLE_APPLICATION_DURATION_TRANSACTION',
      },
    ],
  };

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

  applyRule(ruleValue: string) {
    this.form.patchValue({
      rule: ruleValue,
    });
  }

  ngOnDestroy() {
    this.destroyed$.next();
  }
}
