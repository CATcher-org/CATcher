import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TutorResponseComponent } from '../tutor-response/tutor-response.component';
import { NewTeamResponseComponent } from '../new-team-respond/new-team-response.component';
import { ViewIssueComponent } from './view-issue.component';
import { CommentEditorModule } from '../comment-editor/comment-editor.module';
import { MarkdownModule } from 'ngx-markdown';
import { SharedModule } from '../shared.module';
import { IssueComponentsModule } from '../issue/issue-components.module';
import { LabelDropdownModule } from '../label-dropdown/label-dropdown.module';
import { TesterResponseComponent } from '../tester-response/tester-response.component';

@NgModule({
  exports: [
    ViewIssueComponent
  ],
  declarations: [
    TutorResponseComponent,
    NewTeamResponseComponent,
    TesterResponseComponent,
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
