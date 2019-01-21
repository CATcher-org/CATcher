import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {IssueComponent} from './issue.component';
import {NewIssueComponent} from './new-issue/new-issue.component';

const routes: Routes = [
  { path: 'issues/new', component: NewIssueComponent },
  { path: 'issues/:issue_id', component: IssueComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class IssueRoutingModule {}
