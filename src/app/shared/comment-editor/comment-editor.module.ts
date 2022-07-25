import { NgModule } from '@angular/core';
import { MarkdownModule } from 'ngx-markdown';
import { SharedModule } from '../shared.module';
import { CommentEditorComponent } from './comment-editor.component';
import { ToolbarComponent } from './toolbar/toolbar.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@NgModule({
  imports: [SharedModule, MarkdownModule.forChild(), FontAwesomeModule],
  declarations: [CommentEditorComponent, ToolbarComponent],
  exports: [CommentEditorComponent]
})
export class CommentEditorModule {}
