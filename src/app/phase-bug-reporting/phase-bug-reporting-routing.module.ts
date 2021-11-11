import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../core/guards/auth.guard';
import { PhaseBugReportingComponent } from './phase-bug-reporting.component';
import { NewIssueComponent } from './new-issue/new-issue.component';
import { IssueComponent } from './issue/issue.component';
import { CanDeactivateIssueGuard } from '../core/guards/can-deactivate-issue-guard.service';

const routes: Routes = [
  { path: 'phaseBugReporting', component: PhaseBugReportingComponent, canActivate: [AuthGuard] },
  { path: 'phaseBugReporting/issues/new', component: NewIssueComponent, canActivate: [AuthGuard],
    canDeactivate: [CanDeactivateIssueGuard] },
  { path: 'phaseBugReporting/issues/:issue_id', component: IssueComponent, canActivate: [AuthGuard],
    canDeactivate: [CanDeactivateIssueGuard] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PhaseBugReportingRoutingModule {}
