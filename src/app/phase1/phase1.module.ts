import { NgModule } from '@angular/core';

import {SharedModule} from '../shared/shared.module';
import {Phase1RoutingModule} from './phase1-routing.module';
import {Phase1Component} from './phase1.component';
import {NewIssueComponent} from './new-issue/new-issue.component';
import {IssueComponent} from './issue/issue.component';
import {CommentEditorModule} from '../shared/comment-editor/comment-editor.module';
import {MarkdownModule} from 'ngx-markdown';
import {IssueComponentsModule} from '../shared/issue/issue-components.module';
import {NewTeamResponseComponent} from '../issue/new-team-respond/new-team-response.component';

@NgModule({
  imports: [
    Phase1RoutingModule,
    SharedModule,
    IssueComponentsModule,
    CommentEditorModule,
    MarkdownModule.forChild(),
  ],
  declarations: [
    Phase1Component,
    NewIssueComponent,
    NewTeamResponseComponent,
    IssueComponent,
  ],
})
export class Phase1Module {}
