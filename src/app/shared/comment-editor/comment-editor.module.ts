import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { MarkdownModule } from 'ngx-markdown';
import { SharedModule } from '../shared.module';
import { CommentEditorComponent } from './comment-editor.component';
import { MarkdownToolbarComponent } from './markdown-toolbar/markdown-toolbar.component';

@NgModule({
  imports: [SharedModule, MarkdownModule.forChild()],
  declarations: [CommentEditorComponent, MarkdownToolbarComponent],
  exports: [CommentEditorComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CommentEditorModule {}
