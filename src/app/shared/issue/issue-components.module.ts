import { NgModule } from '@angular/core';
import {TitleComponent} from './title/title.component';
import {SharedModule} from '../shared.module';
import {DescriptionComponent} from './description/description.component';
import {MarkdownModule} from 'ngx-markdown';
import {CommentEditorModule} from '../comment-editor/comment-editor.module';
import {LabelComponent} from './label/label.component';
import {CommentComponent} from './comment/comment.component';
import {AssigneeComponent} from './assignee/assignee.component';
import {DuplicateOfComponent} from './duplicateOf/duplicate-of.component';
import {DuplicatedIssuesComponent} from './duplicatedIssues/duplicated-issues.component';

@NgModule({
  imports: [
    SharedModule,
    CommentEditorModule,
    MarkdownModule.forChild(),
  ],
  declarations: [
    TitleComponent,
    DescriptionComponent,
    LabelComponent,
    CommentComponent,
    AssigneeComponent,
    DuplicateOfComponent,
    DuplicatedIssuesComponent,
  ],
  exports: [
    TitleComponent,
    DescriptionComponent,
    LabelComponent,
    CommentComponent,
    AssigneeComponent,
    DuplicateOfComponent,
    DuplicatedIssuesComponent,
  ]
})
export class IssueComponentsModule { }
