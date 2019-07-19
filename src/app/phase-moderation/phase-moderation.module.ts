import { NgModule } from '@angular/core';

import {SharedModule} from '../shared/shared.module';
import {PhaseModerationComponent} from './phase-moderation.component';
import {PhaseModerationRoutingModule} from './phase-moderation-routing.module';
import { IssueComponent } from './issue/issue.component';
import {IssueComponentsModule} from '../shared/issue/issue-components.module';
import {CommentEditorModule} from '../shared/comment-editor/comment-editor.module';
import {MarkdownModule} from 'ngx-markdown';
import { ViewIssueModule } from '../shared/view-issue/view-issue.module';
import { IssueTablesModule } from '../shared/issue-tables/issue-tables.module';

@NgModule({
  imports: [
    PhaseModerationRoutingModule,
    SharedModule,
    IssueComponentsModule,
    CommentEditorModule,
    ViewIssueModule,
    MarkdownModule.forChild(),
    IssueTablesModule,
  ],
  declarations: [
    PhaseModerationComponent,
    IssueComponent,
  ],
})
export class PhaseModerationModule {}
