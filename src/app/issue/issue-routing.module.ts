import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {ViewIssueComponent} from './view-issue/view-issue.component';

const routes: Routes = [
  { path: 'issues/:issue_id', component: ViewIssueComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class IssueRoutingModule {}
