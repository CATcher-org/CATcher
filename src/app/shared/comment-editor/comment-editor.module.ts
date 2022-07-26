import { NgModule } from '@angular/core';
import { MarkdownModule } from 'ngx-markdown';
import { SharedModule } from '../shared.module';
import { CommentEditorComponent } from './comment-editor.component';
import { ToolbarComponent } from './toolbar/toolbar.component';

@NgModule({
  imports: [SharedModule, MarkdownModule.forChild()],
  declarations: [CommentEditorComponent, ToolbarComponent],
  exports: [CommentEditorComponent]
})
export class CommentEditorModule {}
