import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TutorResponseComponent } from '../tutor-response/tutor-response.component';
import { NewTeamResponseComponent } from '../new-team-respond/new-team-response.component';
import { ViewIssueComponent } from './view-issue.component';
import { CommentEditorModule } from '../comment-editor/comment-editor.module';
import { MarkdownModule } from 'ngx-markdown';
import { SharedModule } from '../shared.module';
import {IssueComponentsModule} from '../issue/issue-components.module';

@NgModule({
  exports: [
    ViewIssueComponent
  ],
  declarations: [
    TutorResponseComponent,
    NewTeamResponseComponent,
    ViewIssueComponent
  ],
  imports: [
    CommonModule,
    CommentEditorModule,
    SharedModule,
    IssueComponentsModule,
    MarkdownModule.forChild(),
  ]
})
export class ViewIssueModule { }
