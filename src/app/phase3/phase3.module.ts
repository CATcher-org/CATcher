import { NgModule } from '@angular/core';

import {SharedModule} from '../shared/shared.module';
import {Phase3Component} from './phase3.component';
import {Phase3RoutingModule} from './phase3-routing.module';
import { IssueComponent } from './issue/issue.component';
import {IssueComponentsModule} from '../shared/issue/issue-components.module';
import {CommentEditorModule} from '../shared/comment-editor/comment-editor.module';
import {MarkdownModule} from 'ngx-markdown';
import { ViewIssueModule } from '../shared/view-issue/view-issue.module';

@NgModule({
  imports: [
    Phase3RoutingModule,
    SharedModule,
    IssueComponentsModule,
    CommentEditorModule,
    ViewIssueModule,
    MarkdownModule.forChild(),
  ],
  declarations: [
    Phase3Component,
    IssueComponent,
  ],
})
export class Phase3Module {}
