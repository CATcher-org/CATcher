import { NgModule } from '@angular/core';

import {IssueRoutingModule} from './issue-routing.module';
import {SharedModule} from '../shared/shared.module';
import {ViewIssueComponent} from './view-issue/view-issue.component';

@NgModule({
  imports: [
    IssueRoutingModule,
    SharedModule
  ],
  declarations: [
    ViewIssueComponent
  ],
})
export class IssueModule {}
