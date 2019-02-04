import { NgModule } from '@angular/core';

import {IssueRoutingModule} from './issue-routing.module';
import {SharedModule} from '../shared/shared.module';
import {IssueComponent} from './issue.component';
import {NewIssueComponent} from './new-issue/new-issue.component';
import {MarkdownModule} from 'ngx-markdown';
import {IssueComponentsModule} from '../shared/issue/issue-components.module';
import {CommentEditorModule} from '../shared/comment-editor/comment-editor.module';

@NgModule({
  imports: [
    IssueRoutingModule,
    IssueComponentsModule,
    SharedModule,
    CommentEditorModule,
    MarkdownModule.forChild(),
  ],
  declarations: [
    IssueComponent,
    NewIssueComponent,
  ],
})
export class IssueModule {}
