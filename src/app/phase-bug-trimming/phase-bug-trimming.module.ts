import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { PhaseBugTrimmingRoutingModule } from './phase-bug-trimming-routing.module';
import { PhaseBugTrimmingComponent } from './phase-bug-trimming.component';
import { IssueComponent } from './issue/issue.component';
import { ViewIssueModule } from '../shared/view-issue/view-issue.module';
import { IssuesDeletedComponent } from './issues-deleted/issues-deleted.component';
import { IssuesPostedComponent } from './issues-posted/issues-posted.component';
import { IssueTablesModule } from '../shared/issue-tables/issue-tables.module';

@NgModule({
  imports: [PhaseBugTrimmingRoutingModule, SharedModule, ViewIssueModule, IssueTablesModule],
  declarations: [PhaseBugTrimmingComponent, IssueComponent, IssuesDeletedComponent, IssuesPostedComponent]
})
export class PhaseBugTrimmingModule {}
