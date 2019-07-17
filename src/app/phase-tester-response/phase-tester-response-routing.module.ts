import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PhaseTesterResponseComponent } from './phase-tester-response.component';
import { AuthGuard } from '../core/guards/auth.guard';
import { IssueComponent } from './issue/issue.component';
import { CanDeactivateIssueGuard } from '../core/guards/can-deactivate-issue-guard.service';

const routes: Routes = [
  { path: 'phaseTesterResponse', component: PhaseTesterResponseComponent, canActivate: [AuthGuard]},
  { path: 'phaseTesterResponse/issues/:issue_id', component: IssueComponent, canActivate: [AuthGuard],
    canDeactivate: [CanDeactivateIssueGuard] }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PhaseTesterResponseRoutingModule { }
