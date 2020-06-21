import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { CommonInterceptor } from './interceptors/common.interceptor';
import { ModalsModule } from './modules/modals/modals.module';
import { AppService } from './services/app.service';
import { StorageService } from './services/storage.service';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { TranslateService } from '@ngx-translate/core';
import { PaginatorI18n } from './services/paginatorIntl.service';

const sharedModules = [
  CommonModule,
  ModalsModule,
  HttpClientModule,
  MatListModule,
  MatSidenavModule,
  MatButtonModule,
  MatIconModule,
  MatToolbarModule,
];

@NgModule({
  imports: sharedModules,
  exports: sharedModules,
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: CommonInterceptor, multi: true },
    AppService,
    StorageService,
    {
      provide: MatPaginatorIntl,
      deps: [TranslateService],
      useClass: PaginatorI18n,
    },
  ],
})
export class SharedModule {}
