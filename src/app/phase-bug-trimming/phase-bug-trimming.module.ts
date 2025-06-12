import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { PhaseBugTrimmingRoutingModule } from './phase-bug-trimming-routing.module';
import { PhaseBugTrimmingComponent } from './phase-bug-trimming.component';
import { ViewIssueModule } from '../shared/view-issue/view-issue.module';
import { IssueTablesModule } from '../shared/issue-tables/issue-tables.module';
import { IssueComponentsModule } from '../shared/issue/issue-components.module';
import { IssueViewModule } from '../shared/issue-view/issue-view.module';

@NgModule({
  imports: [PhaseBugTrimmingRoutingModule, SharedModule, ViewIssueModule, IssueTablesModule, IssueComponentsModule, IssueViewModule],
  declarations: [PhaseBugTrimmingComponent]
})
export class PhaseBugTrimmingModule {}
