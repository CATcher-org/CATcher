import { NgModule } from '@angular/core';
import {TitleComponent} from './title/title.component';
import {SharedModule} from '../shared.module';
import {DescriptionComponent} from './description/description.component';
import {MarkdownModule} from 'ngx-markdown';
import {CommentEditorModule} from '../comment-editor/comment-editor.module';
import {LabelComponent} from './label/label.component';
import {CommentComponent} from './comment/comment.component';

@NgModule({
  imports: [
    SharedModule,
    CommentEditorModule,
    MarkdownModule.forChild(),
  ],
  declarations: [
    TitleComponent,
    DescriptionComponent,
    LabelComponent,
    CommentComponent
  ],
  exports: [
    TitleComponent,
    DescriptionComponent,
    LabelComponent,
    CommentComponent
  ]
})
export class IssueComponentsModule { }
