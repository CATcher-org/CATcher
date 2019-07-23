import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { PhaseTeamResponseComponent } from './phase-team-response.component';
import { PhaseTeamResponseRoutingModule } from './phase-team-response-routing.module';
import { IssueComponent } from './issue/issue.component';
import { IssueComponentsModule } from '../shared/issue/issue-components.module';
import { CommentEditorModule } from '../shared/comment-editor/comment-editor.module';
import { MarkdownModule } from 'ngx-markdown';
import { IssuesPendingComponent } from './issues-pending/issues-pending.component';
import { IssuesRespondedComponent } from './issues-responded/issues-responded.component';
import { IssuesFaultyComponent } from './issues-faulty/issues-faulty.component';
import { ViewIssueModule } from '../shared/view-issue/view-issue.module';
import { IssueTablesModule } from '../shared/issue-tables/issue-tables.module';

@NgModule({
  imports: [
    PhaseTeamResponseRoutingModule,
    SharedModule,
    IssueComponentsModule,
    CommentEditorModule,
    ViewIssueModule,
    MarkdownModule.forChild(),
    IssueTablesModule,
  ],
  declarations: [
    PhaseTeamResponseComponent,
    IssueComponent,
    IssuesPendingComponent,
    IssuesRespondedComponent,
    IssuesFaultyComponent,
  ],
})
export class PhaseTeamResponseModule {}
