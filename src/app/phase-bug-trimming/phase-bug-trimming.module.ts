import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { PhaseBugTrimmingRoutingModule } from './phase-bug-trimming-routing.module';
import { PhaseBugTrimmingComponent } from './phase-bug-trimming.component';
import { IssueComponent } from './issue/issue.component';
import { ViewIssueModule } from '../shared/view-issue/view-issue.module';

@NgModule({
  imports: [PhaseBugTrimmingRoutingModule, SharedModule, ViewIssueModule],
  declarations: [PhaseBugTrimmingComponent, IssueComponent]
})
export class PhaseBugTrimmingModule {}
