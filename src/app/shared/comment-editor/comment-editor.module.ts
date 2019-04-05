import { NgModule } from '@angular/core';
import {SharedModule} from '../shared.module';
import {MarkdownModule} from 'ngx-markdown';
import {CommentEditorComponent} from './comment-editor.component';
import {CtrlKeysDirective} from '../../core/directives/ctrl-key.directive';

@NgModule({
  imports: [
    SharedModule,
    MarkdownModule.forChild(),
  ],
  declarations: [
    CommentEditorComponent,
    CtrlKeysDirective,
  ],
  exports: [
    CommentEditorComponent
  ]
})
export class CommentEditorModule { }
