import { NgModule } from '@angular/core';
import {MatProgressBarModule} from '@angular/material';
import {TitleComponent} from './title/title.component';
import {SharedModule} from '../shared.module';
import {DescriptionComponent} from './description/description.component';
import {MarkdownModule} from 'ngx-markdown';
import {CommentEditorModule} from '../comment-editor/comment-editor.module';
import {LabelComponent} from './label/label.component';
import {TeamResponseComponent} from './team-response/team-response.component';
import {AssigneeComponent} from './assignee/assignee.component';
import {DuplicateOfComponent} from './duplicateOf/duplicate-of.component';
import {DuplicatedIssuesComponent} from './duplicatedIssues/duplicated-issues.component';
import { UnsureCheckboxComponent } from './unsure-checkbox/unsure-checkbox.component';

@NgModule({
  imports: [
    SharedModule,
    CommentEditorModule,
    MatProgressBarModule,
    MarkdownModule.forChild(),
  ],
  declarations: [
    TitleComponent,
    DescriptionComponent,
    LabelComponent,
    TeamResponseComponent,
    AssigneeComponent,
    DuplicateOfComponent,
    DuplicatedIssuesComponent,
    UnsureCheckboxComponent,
  ],
  exports: [
    TitleComponent,
    DescriptionComponent,
    LabelComponent,
    TeamResponseComponent,
    AssigneeComponent,
    DuplicateOfComponent,
    DuplicatedIssuesComponent,
    UnsureCheckboxComponent,
  ]
})
export class IssueComponentsModule { }
