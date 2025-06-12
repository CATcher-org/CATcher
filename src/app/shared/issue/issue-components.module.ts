import { NgModule } from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MarkdownModule } from 'ngx-markdown';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { CommentEditorModule } from '../comment-editor/comment-editor.module';
import { SharedModule } from '../shared.module';
import { AssigneeComponent } from './assignee/assignee.component';
import { ConflictDialogComponent } from './conflict-dialog/conflict-dialog.component';
import { DescriptionComponent } from './description/description.component';
import { DuplicatedIssuesComponent } from './duplicatedIssues/duplicated-issues.component';
import { DuplicateOfComponent } from './duplicateOf/duplicate-of.component';
import { LabelComponent } from './label/label.component';
import { TitleComponent } from './title/title.component';
import { UnsureCheckboxComponent } from './unsure-checkbox/unsure-checkbox.component';
import { IssueComponent } from './issue.component';
import { IssuesDeletedComponent } from './issues-deleted.component';
import { IssuesPostedComponent } from './issues-posted.component';

@NgModule({
  imports: [SharedModule, CommentEditorModule, MatProgressBarModule, NgxMatSelectSearchModule, MarkdownModule.forChild()],
  declarations: [
    TitleComponent,
    DescriptionComponent,
    LabelComponent,
    AssigneeComponent,
    DuplicateOfComponent,
    DuplicatedIssuesComponent,
    UnsureCheckboxComponent,
    ConflictDialogComponent,
    IssueComponent,
    IssuesDeletedComponent,
    IssuesPostedComponent
  ],
  exports: [
    TitleComponent,
    DescriptionComponent,
    LabelComponent,
    AssigneeComponent,
    DuplicateOfComponent,
    DuplicatedIssuesComponent,
    UnsureCheckboxComponent,
    ConflictDialogComponent,
    IssueComponent,
    IssuesDeletedComponent,
    IssuesPostedComponent
  ]
})
export class IssueComponentsModule {}
