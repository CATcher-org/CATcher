import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommentEditorModule } from '../../comment-editor/comment-editor.module';
import { SharedModule } from '../../shared.module';
import { IssueComponentsModule } from '../../issue/issue-components.module';
import { LabelDropdownModule } from '../../label-dropdown/label-dropdown.module';
import { MarkdownModule } from 'ngx-markdown';
import { IssueDisputeComponent } from './issue-dispute.component';

@NgModule({
  exports: [
    IssueDisputeComponent
  ],
  declarations: [
    IssueDisputeComponent,
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
export class IssueDisputeModule { }
