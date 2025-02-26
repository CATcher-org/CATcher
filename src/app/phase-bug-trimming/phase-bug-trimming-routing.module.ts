import { IssueComponent } from './issue/issue.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../core/guards/auth.guard';
import { CanDeactivateIssueGuard } from '../core/guards/can-deactivate-issue-guard.service';
import { PhaseBugTrimmingComponent } from './phase-bug-trimming.component';

const routes: Routes = [
  { path: 'phaseBugTrimming', component: PhaseBugTrimmingComponent, canActivate: [AuthGuard] },
  {
    path: 'phaseBugTrimming/issues/:issue_id',
    component: IssueComponent,
    canActivate: [AuthGuard],
    canDeactivate: [CanDeactivateIssueGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PhaseBugTrimmingRoutingModule {}
