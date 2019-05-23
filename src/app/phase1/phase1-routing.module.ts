import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../core/guards/auth.guard';
import {Phase1Component} from './phase1.component';
import {NewIssueComponent} from './new-issue/new-issue.component';
import {IssueComponent} from './issue/issue.component';
import {CanDeactivateIssueGuard} from '../core/guards/can-deactivate-issue-guard.service';

const routes: Routes = [
  { path: 'phase1', component: Phase1Component, canActivate: [AuthGuard] },
  { path: 'phase1/issues/new', component: NewIssueComponent, canActivate: [AuthGuard]},
  { path: 'phase1/issues/:issue_id', component: IssueComponent, canActivate: [AuthGuard], canDeactivate: [CanDeactivateIssueGuard] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class Phase1RoutingModule {}
