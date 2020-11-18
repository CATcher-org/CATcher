import { NgModule } from '@angular/core';
import { SharedModule } from '../shared.module';
import { MarkdownModule } from 'ngx-markdown';
import { CommentEditorComponent } from './comment-editor.component';

@NgModule({
  imports: [
    SharedModule,
    MarkdownModule.forChild(),
  ],
  declarations: [
    CommentEditorComponent,
  ],
  exports: [
    CommentEditorComponent
  ]
})
export class CommentEditorModule { }
