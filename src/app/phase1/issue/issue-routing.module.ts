import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {IssueComponent} from './issue.component';
import {NewIssueComponent} from './new-issue/new-issue.component';
import {AuthGuard} from '../../core/guards/auth.guard';


const routes: Routes = [
  { path: 'issues/new', component: NewIssueComponent, canActivate: [AuthGuard]},
  { path: 'issues/:issue_id', component: IssueComponent, canActivate: [AuthGuard] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class IssueRoutingModule {}
