import {
  Component,
  ChangeDetectionStrategy,
  Input,
  OnChanges,
  SimpleChanges,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { OwnerType, RuleStatus } from 'src/app/shared/enums/rules.type';
import { BehaviorSubject, Subject, combineLatest, of } from 'rxjs';
import { RulesService } from 'src/app/shared/services/rules.service';
import {
  takeUntil,
  switchMap,
  tap,
  startWith,
  map,
  debounce,
  debounceTime,
  distinctUntilChanged,
} from 'rxjs/operators';
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
export class RuleListComponent implements OnChanges, OnInit, OnDestroy {
  private destroyed$ = new Subject();

  @Input() ownerId: string;
  @Input() ownerType: OwnerType;

  private ownerID$ = new BehaviorSubject<string>(this.ownerId);

  private loadingSubject$ = new BehaviorSubject<boolean>(false);

  loading$ = this.loadingSubject$.asObservable();

  private refresh$ = new BehaviorSubject<void>(null);

  private ownerType$ = new BehaviorSubject<OwnerType>(this.ownerType);

  private toggleSubject$ = new Subject<{ id: string; state: boolean }>();

  rulesList$ = combineLatest(this.ownerID$, this.ownerType$, this.refresh$).pipe(
    tap(() => this.loadingSubject$.next(true)),
    switchMap(([id, type]) => this.rulesService.getRulesByOwnerId(id, type)),
    map((list) => (list || []).filter((rule) => rule.status !== RuleStatus.RULE_STATUS_REMOVED)),
    tap(() => this.loadingSubject$.next(false)),
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

  ngOnInit() {
    this.toggleSubject$
      .pipe(
        debounceTime(300),
        distinctUntilChanged((x, y) => {
          return x.id === y.id && x.state === y.state;
        }),
        switchMap((item) =>
          item.state ? this.rulesService.activate(item.id) : this.rulesService.deactivate(item.id),
        ),
        takeUntil(this.destroyed$),
      )
      .subscribe(() => {
        this.refresh$.next();
      });
  }

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
    this.toggleSubject$.next({
      id: ruleId,
      state: event.checked,
    });
  }

  remove(ruleId: string) {
    this.rulesService
      .remove(ruleId)
      .pipe(takeUntil(this.destroyed$))
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
