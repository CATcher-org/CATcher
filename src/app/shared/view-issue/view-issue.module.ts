import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NewTeamResponseComponent } from '../new-team-respond/new-team-response.component';
import { ViewIssueComponent } from './view-issue.component';
import { CommentEditorModule } from '../comment-editor/comment-editor.module';
import { MarkdownModule } from 'ngx-markdown';
import { SharedModule } from '../shared.module';
import { IssueComponentsModule } from '../issue/issue-components.module';
import { LabelDropdownModule } from '../label-dropdown/label-dropdown.module';
import { TesterResponseComponent } from '../tester-response/tester-response.component';
import { IssueDisputeComponent } from '../issue-dispute/issue-dispute.component';
import { FormDisableControlDirective } from '../../core/directives/form-disable-control.directive';

@NgModule({
  exports: [
    ViewIssueComponent
  ],
  declarations: [
    FormDisableControlDirective,
    NewTeamResponseComponent,
    TesterResponseComponent,
    IssueDisputeComponent,
    ViewIssueComponent
  ],
  imports: [
    CommonModule,
    CommentEditorModule,
    SharedModule,
    IssueComponentsModule,
    LabelDropdownModule,
    MarkdownModule.forChild(),
  ]
})
export class ViewIssueModule { }
