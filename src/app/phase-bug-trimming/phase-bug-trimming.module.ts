import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { PhaseBugTrimmingRoutingModule } from './phase-bug-trimming-routing.module';
import { PhaseBugTrimmingComponent } from './phase-bug-trimming.component';
import { ViewIssueModule } from '../shared/view-issue/view-issue.module';
import { IssueTablesModule } from '../shared/issue-tables/issue-tables.module';
import { IssueComponentsModule } from '../shared/issue/issue-components.module';
import { IssuePageModule } from '../shared/issue-view/issue-page.module';

@NgModule({
  imports: [PhaseBugTrimmingRoutingModule, SharedModule, ViewIssueModule, IssueTablesModule, IssueComponentsModule, IssuePageModule],
  declarations: [PhaseBugTrimmingComponent]
})
export class PhaseBugTrimmingModule {}
