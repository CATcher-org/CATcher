import { NgModule } from '@angular/core';

import {IssueRoutingModule} from './issue-routing.module';
import {SharedModule} from '../shared/shared.module';
import {IssueComponent} from './issue.component';
import {NewIssueComponent} from './new-issue/new-issue.component';
import {MarkdownModule} from 'ngx-markdown';

@NgModule({
  imports: [
    IssueRoutingModule,
    SharedModule,
    MarkdownModule.forChild(),
  ],
  declarations: [
    IssueComponent,
    NewIssueComponent,
  ],
})
export class IssueModule {}
