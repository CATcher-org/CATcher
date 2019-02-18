import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home.component';
import { AuthGuard } from '../auth/auth.guard';
import { Phase2Component} from './phase2/phase2.component';
import { Phase3Component } from './phase3/phase3.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'phase2',
    component: Phase2Component,
    canActivate: [AuthGuard],
  },
  {
    path: 'phase3',
    component: Phase3Component,
    canActivate: [AuthGuard],
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeRoutingModule {}
