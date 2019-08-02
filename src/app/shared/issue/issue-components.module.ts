import { NgModule } from '@angular/core';
import {MatProgressBarModule} from '@angular/material';
import {TitleComponent} from './title/title.component';
import {SharedModule} from '../shared.module';
import {DescriptionComponent} from './description/description.component';
import {MarkdownModule} from 'ngx-markdown';
import {CommentEditorModule} from '../comment-editor/comment-editor.module';
import {LabelComponent} from './label/label.component';
import {ResponseComponent} from './response/response.component';
import {AssigneeComponent} from './assignee/assignee.component';
import {DuplicateOfComponent} from './duplicateOf/duplicate-of.component';
import {DuplicatedIssuesComponent} from './duplicatedIssues/duplicated-issues.component';
import { TodoListComponent } from './todo-list/todo-list.component';
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
    ResponseComponent,
    AssigneeComponent,
    DuplicateOfComponent,
    DuplicatedIssuesComponent,
    TodoListComponent,
    UnsureCheckboxComponent,
  ],
  exports: [
    TitleComponent,
    DescriptionComponent,
    LabelComponent,
    ResponseComponent,
    AssigneeComponent,
    DuplicateOfComponent,
    DuplicatedIssuesComponent,
    TodoListComponent,
    UnsureCheckboxComponent,
  ]
})
export class IssueComponentsModule { }
