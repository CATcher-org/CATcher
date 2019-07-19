import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../core/guards/auth.guard';
import {PhaseModerationComponent} from './phase-moderation.component';
import {IssueComponent} from './issue/issue.component';
import {CanDeactivateIssueGuard} from '../core/guards/can-deactivate-issue-guard.service';

const routes: Routes = [
  {
    path: 'phaseModeration',
    component: PhaseModerationComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'phaseModeration/issues/:issue_id',
    component: IssueComponent,
    canActivate: [AuthGuard],
    canDeactivate: [CanDeactivateIssueGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PhaseModerationRoutingModule {}
