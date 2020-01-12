import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ViewIssueComponent } from './view-issue.component';
import { CommentEditorModule } from '../comment-editor/comment-editor.module';
import { MarkdownModule } from 'ngx-markdown';
import { SharedModule } from '../shared.module';
import { IssueComponentsModule } from '../issue/issue-components.module';
import { LabelDropdownModule } from '../label-dropdown/label-dropdown.module';
import { NewTeamResponseModule } from './new-team-response/new-team-response.module';
import { IssueDisputeModule } from './issue-dispute/issue-dispute.module';
import { TesterResponseModule } from './tester-response/tester-response.module';
import { TeamResponseModule } from './team-response/team-response.module';

@NgModule({
  exports: [
    ViewIssueComponent
  ],
  declarations: [
    ViewIssueComponent
  ],
  imports: [
    CommonModule,
    CommentEditorModule,
    NewTeamResponseModule,
    TeamResponseModule,
    IssueDisputeModule,
    TesterResponseModule,
    SharedModule,
    IssueComponentsModule,
    LabelDropdownModule,
    MarkdownModule.forChild(),
  ]
})
export class ViewIssueModule { }
