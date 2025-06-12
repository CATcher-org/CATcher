import { NgModule } from '@angular/core';
import { MarkdownModule } from 'ngx-markdown';
import { CommentEditorModule } from '../shared/comment-editor/comment-editor.module';
import { IssueTablesModule } from '../shared/issue-tables/issue-tables.module';
import { IssueComponentsModule } from '../shared/issue/issue-components.module';
import { LabelDropdownModule } from '../shared/label-dropdown/label-dropdown.module';
import { SharedModule } from '../shared/shared.module';
import { ViewIssueModule } from '../shared/view-issue/view-issue.module';
import { NewIssueComponent } from './new-issue/new-issue.component';
import { PhaseBugReportingRoutingModule } from './phase-bug-reporting-routing.module';
import { PhaseBugReportingComponent } from './phase-bug-reporting.component';
import { IssuesPostedComponent } from './issues-posted/issues-posted.component';
import { IssuesDeletedComponent } from './issues-deleted/issues-deleted.component';

@NgModule({
  imports: [
    PhaseBugReportingRoutingModule,
    SharedModule,
    IssueComponentsModule,
    CommentEditorModule,
    ViewIssueModule,
    MarkdownModule.forChild(),
    IssueTablesModule,
    LabelDropdownModule
  ],
  declarations: [PhaseBugReportingComponent, NewIssueComponent, IssuesPostedComponent, IssuesDeletedComponent]
})
export class PhaseBugReportingModule {}
