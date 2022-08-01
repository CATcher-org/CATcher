import { NgModule } from '@angular/core';
import { MarkdownModule } from 'ngx-markdown';
import { SharedModule } from '../shared.module';
import { CommentEditorComponent } from './comment-editor.component';
import { MarkdownToolbarComponent } from './markdown-toolbar/markdown-toolbar.component';

@NgModule({
  imports: [SharedModule, MarkdownModule.forChild()],
  declarations: [CommentEditorComponent, MarkdownToolbarComponent],
  exports: [CommentEditorComponent]
})
export class CommentEditorModule {}
