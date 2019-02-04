import { NgModule } from '@angular/core';
import {TitleComponent} from './title/title.component';
import {SharedModule} from '../shared.module';
import {CommentComponent} from './comment/comment.component';
import {MarkdownModule} from 'ngx-markdown';
import {CommentEditorModule} from '../comment-editor/comment-editor.module';
import {LabelComponent} from './label/label.component';

@NgModule({
  imports: [
    SharedModule,
    CommentEditorModule,
    MarkdownModule.forChild(),
  ],
  declarations: [
    TitleComponent,
    CommentComponent,
    LabelComponent
  ],
  exports: [
    TitleComponent,
    CommentComponent,
    LabelComponent
  ]
})
export class IssueComponentsModule { }
