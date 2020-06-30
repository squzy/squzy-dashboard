import {
  Component,
  ChangeDetectionStrategy,
  Input,
  OnChanges,
  SimpleChanges,
  OnDestroy,
} from '@angular/core';
import { OwnerType, RuleStatus } from 'src/app/shared/enums/rules.type';
import { BehaviorSubject, Subject, combineLatest, of } from 'rxjs';
import { RulesService } from 'src/app/shared/services/rules.service';
import { takeUntil, switchMap, tap, finalize, startWith, delay, map } from 'rxjs/operators';
import { Rule } from 'src/app/shared/interfaces/rules.interfaces';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { AddRuleService } from '../../../modals/add-rule/add-rule.service';
import { Router } from '@angular/router';

@Component({
  selector: 'sqd-rule-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RuleListComponent implements OnChanges, OnDestroy {
  private destroyed$ = new Subject();

  @Input() ownerId: string;
  @Input() ownerType: OwnerType;

  private ownerID$ = new BehaviorSubject<string>(this.ownerId);

  private loadingSubject$ = new BehaviorSubject<boolean>(false);

  loading$ = this.loadingSubject$.asObservable();

  private refresh$ = new Subject();

  private ownerType$ = new BehaviorSubject<OwnerType>(this.ownerType);

  rulesList$ = combineLatest(
    this.ownerID$,
    this.ownerType$,
    this.refresh$.pipe(startWith(null)),
  ).pipe(
    switchMap(([id, type]) => this.rulesService.getRulesByOwnerId(id, type)),
    map((list) => (list || []).filter((rule) => rule.status !== RuleStatus.RULE_STATUS_REMOVED)),
    takeUntil(this.destroyed$),
  );

  ACTIVE_STATUS = RuleStatus.RULE_STATUS_ACTIVE;

  REMOVED = RuleStatus.RULE_STATUS_REMOVED;

  UNCPECIFIED = RuleStatus.RULE_STATUS_UNSPECIFIED;

  constructor(
    private rulesService: RulesService,
    private addRulesService: AddRuleService,
    private router: Router,
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if ('ownerId' in changes) {
      this.ownerID$.next(changes.ownerId.currentValue);
    }

    if ('ownerType' in changes) {
      this.ownerType$.next(changes.ownerType.currentValue);
    }
  }

  addRule() {
    this.addRulesService
      .open(this.ownerType, this.ownerId)
      .pipe(takeUntil(this.destroyed$))
      .subscribe((res) => {
        if (res && res.id) {
          this.refresh$.next();
        }
      });
  }

  trackByFn(rule: Rule) {
    return rule.id;
  }

  toggleRule(event: MatSlideToggleChange, ruleId: string) {
    of(event.checked)
      .pipe(
        tap(() => this.loadingSubject$.next(true)),
        finalize(() => this.loadingSubject$.next(false)),
        switchMap((checked) =>
          checked ? this.rulesService.activate(ruleId) : this.rulesService.deactivate(ruleId),
        ),
        takeUntil(this.destroyed$),
      )
      .subscribe(() => {
        this.refresh$.next();
      });
  }

  remove(ruleId: string) {
    this.rulesService
      .remove(ruleId)
      .pipe(
        tap(() => this.loadingSubject$.next(true)),
        finalize(() => this.loadingSubject$.next(false)),
        takeUntil(this.destroyed$),
      )
      .subscribe(() => {
        this.refresh$.next();
      });
  }

  goToInidentList(ruleId: string) {
    this.router.navigate(['incidents', 'list'], {
      queryParams: {
        ruleId,
      },
    });
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}
