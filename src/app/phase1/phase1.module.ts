import { NgModule } from '@angular/core';

import {SharedModule} from '../shared/shared.module';
import {Phase1RoutingModule} from './phase1-routing.module';
import {Phase1Component} from './phase1.component';
import {NewIssueComponent} from './new-issue/new-issue.component';
import {IssueComponent} from './issue/issue.component';
import {CommentEditorModule} from '../shared/comment-editor/comment-editor.module';
import {MarkdownModule} from 'ngx-markdown';
import {IssueComponentsModule} from '../shared/issue/issue-components.module';
import { ViewIssueModule } from '../shared/view-issue/view-issue.module';
import { IssueTablesModule } from '../shared/issue-tables/issue-tables.module';
import { LabelDropdownModule } from '../shared/label-dropdown/label-dropdown.module';

@NgModule({
  imports: [
    Phase1RoutingModule,
    SharedModule,
    IssueComponentsModule,
    CommentEditorModule,
    ViewIssueModule,
    MarkdownModule.forChild(),
    IssueTablesModule,
    LabelDropdownModule
  ],
  declarations: [
    Phase1Component,
    NewIssueComponent,
    IssueComponent,
  ],
})
export class Phase1Module {}
