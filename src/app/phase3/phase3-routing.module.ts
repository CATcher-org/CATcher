import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../core/guards/auth.guard';
import {Phase3Component} from './phase3.component';
import {IssueComponent} from './issue/issue.component';

const routes: Routes = [
  {
    path: 'phase3',
    component: Phase3Component,
    canActivate: [AuthGuard],
  },
  {
    path: 'phase3/issues/:issue_id',
    component: IssueComponent,
    canActivate: [AuthGuard],
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class Phase3RoutingModule {}
