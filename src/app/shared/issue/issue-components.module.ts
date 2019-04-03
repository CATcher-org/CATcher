import { NgModule } from '@angular/core';
import {MatProgressBarModule} from '@angular/material';
import {TitleComponent} from './title/title.component';
import {SharedModule} from '../shared.module';
import {DescriptionComponent} from './description/description.component';
import {MarkdownModule} from 'ngx-markdown';
import {CommentEditorModule} from '../comment-editor/comment-editor.module';
import {LabelComponent} from './label/label.component';
import {CommentComponent} from './comment/comment.component';
import {AssigneeComponent} from './assignee/assignee.component';
import {DuplicateOfComponent} from './duplicateOf/duplicate-of.component';
import { TodoListComponent } from './todo-list/todo-list.component';

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
    CommentComponent,
    AssigneeComponent,
    DuplicateOfComponent,
    TodoListComponent,
  ],
  exports: [
    TitleComponent,
    DescriptionComponent,
    LabelComponent,
    CommentComponent,
    AssigneeComponent,
    DuplicateOfComponent,
    TodoListComponent,
  ]
})
export class IssueComponentsModule { }
