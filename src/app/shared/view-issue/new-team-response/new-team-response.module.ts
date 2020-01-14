import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NewTeamResponseComponent } from './new-team-response.component';
import { CommentEditorModule } from '../../comment-editor/comment-editor.module';
import { SharedModule } from '../../shared.module';
import { IssueComponentsModule } from '../../issue/issue-components.module';
import { LabelDropdownModule } from '../../label-dropdown/label-dropdown.module';
import { MarkdownModule } from 'ngx-markdown';
import { ConflictDialogComponent } from './conflict-dialog/conflict-dialog.component';

@NgModule({
  exports: [
    NewTeamResponseComponent,
    ConflictDialogComponent,
  ],
  declarations: [
    NewTeamResponseComponent,
    ConflictDialogComponent,
  ],
  imports: [
    CommonModule,
    CommentEditorModule,
    SharedModule,
    IssueComponentsModule,
    LabelDropdownModule,
    MarkdownModule.forChild(),
  ],
  entryComponents: [
    ConflictDialogComponent,
  ]
})
export class NewTeamResponseModule { }
