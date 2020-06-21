import { Component, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { map, switchMap, tap, filter, takeUntil, startWith } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { AgentsService } from '../../services/agents.service';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { BehaviorSubject, Subject } from 'rxjs';
import { AgentStatus } from 'src/app/shared/enums/agent.type';
import { ErrorStateMatcher } from '@angular/material/core';
import { FormControl, FormGroupDirective, NgForm, Validators, FormBuilder } from '@angular/forms';
import { minusMinute, FormRangeValue } from 'src/app/shared/date/date';
import { dateFromToValidator } from 'src/app/shared/validators/date.validators';

class CrossFieldErrorMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    return control.dirty && form.invalid;
  }
}

function getFilterValue() {
  const now = new Date(Date.now());
  return {
    dateFrom: minusMinute(+now, 10),
    dateTo: now,
  };
}

@Component({
  selector: 'sqd-agents',
  templateUrl: './agents.component.html',
  styleUrls: ['./agents.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AgentsComponent implements OnDestroy {
  private destroyed$ = new Subject();

  showDisabled$ = this.agentService.getMenuSettings();

  agents$ = this.showDisabled$.pipe(
    switchMap((value) =>
      this.agentService.getList().pipe(
        map((list) => {
          if (value) {
            return list;
          }
          return list.filter((item) => item.status !== AgentStatus.UNREGISTRED);
        }),
      ),
    ),
    takeUntil(this.destroyed$),
  );

  initailValue = getFilterValue();

  errorMatcher = new CrossFieldErrorMatcher();

  rangeForm = this.fb.group(
    {
      dateFrom: [this.initailValue.dateFrom, Validators.required],
      dateTo: [this.initailValue.dateTo, Validators.required],
    },
    {
      validators: [dateFromToValidator],
    },
  );

  rangeValues$ = this.rangeForm.valueChanges.pipe(
    startWith(this.initailValue),
    filter(() => this.rangeForm.valid),
  );

  types$ = this.agentService.getTypes();

  currentId$ = this.route.params.pipe(map((p) => p.id));

  currentType$ = this.route.params.pipe(
    map((v) => v.type),
    filter((v) => !!v),
    takeUntil(this.destroyed$),
  );

  LIVE_TYPE = AgentsService.LIVE;
  CPU_TYPE = AgentsService.CPU;
  MEMORY_TYPE = AgentsService.MEMORY;
  DISK_TYPE = AgentsService.DISK;
  NET_TYPE = AgentsService.NET;

  currentAgent$ = this.currentId$.pipe(
    switchMap((id: string) => this.agentService.getById(id)),
    takeUntil(this.destroyed$),
  );

  iconByType = {
    [AgentsService.LIVE]: 'live_tv',
    [AgentsService.MEMORY]: 'memory',
    [AgentsService.NET]: 'signal_cellular_alt',
    [AgentsService.DISK]: 'storage',
    [AgentsService.CPU]: 'laptop',
  };

  constructor(
    private agentService: AgentsService,
    private route: ActivatedRoute,
    private fb: FormBuilder,
  ) {}

  changeVisibility(event: MatCheckboxChange) {
    this.showDisabled$.next(event.checked);
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}
