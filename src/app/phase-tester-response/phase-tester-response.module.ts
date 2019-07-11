import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PhaseTesterResponseRoutingModule } from './phase-tester-response-routing.module';
import { PhaseTesterResponseComponent } from './phase-tester-response.component';
import { IssueComponent } from './issue/issue.component';
import { ViewIssueModule } from '../shared/view-issue/view-issue.module';
import { IssueTablesModule } from '../shared/issue-tables/issue-tables.module';
import { MarkdownModule } from 'ngx-markdown';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  exports: [PhaseTesterResponseComponent],
  declarations: [PhaseTesterResponseComponent, IssueComponent],
  imports: [
    CommonModule,
    PhaseTesterResponseRoutingModule,
    SharedModule,
    ViewIssueModule,
    IssueTablesModule,
    MarkdownModule.forChild()
  ]
})
export class PhaseTesterResponseModule { }
