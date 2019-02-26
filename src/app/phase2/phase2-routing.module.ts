import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../core/guards/auth.guard';
import {Phase2Component} from './phase2.component';
import {IssueComponent} from './issue/issue.component';

const routes: Routes = [
  { path: 'phase2', component: Phase2Component, canActivate: [AuthGuard] },
  { path: 'phase2/issues/:issue_id', component: IssueComponent, canActivate: [AuthGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class Phase2RoutingModule {}
