import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RuleListComponent } from './components/rule-list/list.component';
import { MatListModule } from '@angular/material/list';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { TranslateModule } from '@ngx-translate/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  imports: [
    CommonModule,
    MatListModule,
    MatSlideToggleModule,
    MatCheckboxModule,
    MatTooltipModule,
    MatIconModule,
    MatButtonModule,
    TranslateModule.forChild({}),
  ],
  declarations: [RuleListComponent],
  exports: [RuleListComponent],
})
export class RulesModule {}
