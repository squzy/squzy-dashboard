import { Component, ChangeDetectionStrategy, OnDestroy, OnInit } from '@angular/core';
import { AppService } from './shared/services/app.service';
import { TranslateService } from '@ngx-translate/core';
import { MatSelectChange } from '@angular/material/select';
import { Subject, BehaviorSubject } from 'rxjs';
import { takeUntil, startWith, tap } from 'rxjs/operators';
import { StorageService } from './shared/services/storage.service';
import { AddRuleService } from './shared/modules/modals/add-rule/add-rule.service';
import { OwnerType } from './shared/enums/rules.type';

@Component({
  selector: 'sqd-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit, OnDestroy {
  private destroyed$ = new Subject();

  version$ = this.appService.getVersion().pipe(takeUntil(this.destroyed$));

  locales = ['en', 'ru'];

  links = [
    {
      path: '/agents',
      text: 'MENU.AGENTS',
    },
    {
      path: '/checkers',
      text: 'MENU.CHECKERS',
    },
    {
      path: 'applications',
      text: 'MENU.APPLICATIONS',
    },
  ];

  private readonly STORAGE_KEY = 'LANG';

  currentLocale$ = new BehaviorSubject(
    this.storageService.get(this.STORAGE_KEY) || this.locales[0],
  );

  constructor(
    private appService: AppService,
    private translateService: TranslateService,
    private storageService: StorageService,
    private addRuleService: AddRuleService,
  ) {}

  ngOnInit() {
    this.currentLocale$
      .pipe(
        tap((locale) => this.storageService.set(this.STORAGE_KEY, locale)),
        tap((locale) => this.translateService.use(locale)),
        takeUntil(this.destroyed$),
      )
      .subscribe();

    this.addRuleService.open(OwnerType.INCIDENT_OWNER_TYPE_AGENT, 'asf');
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  trackBy(str: string) {
    return str;
  }

  setLang(locale: string) {
    this.currentLocale$.next(locale);
  }
}
