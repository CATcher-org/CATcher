import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ViewIssueComponent } from './view-issue.component';
import { CommentEditorModule } from '../comment-editor/comment-editor.module';
import { MarkdownModule } from 'ngx-markdown';
import { SharedModule } from '../shared.module';
import { IssueComponentsModule } from '../issue/issue-components.module';
import { LabelDropdownModule } from '../label-dropdown/label-dropdown.module';
import { TesterResponseComponent } from './tester-response/tester-response.component';
import { IssueDisputeComponent } from './issue-dispute/issue-dispute.component';
import { FormDisableControlDirective } from '../../core/directives/form-disable-control.directive';
import { NewTeamResponseModule } from './new-team-response/new-team-response.module';

@NgModule({
  exports: [
    ViewIssueComponent
  ],
  declarations: [
    FormDisableControlDirective,
    TesterResponseComponent,
    IssueDisputeComponent,
    ViewIssueComponent
  ],
  imports: [
    CommonModule,
    CommentEditorModule,
    NewTeamResponseModule,
    SharedModule,
    IssueComponentsModule,
    LabelDropdownModule,
    MarkdownModule.forChild(),
  ]
})
export class ViewIssueModule { }
