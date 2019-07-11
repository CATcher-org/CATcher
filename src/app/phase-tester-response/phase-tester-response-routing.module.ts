import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PhaseTesterResponseComponent } from './phase-tester-response.component';
import { AuthGuard } from '../core/guards/auth.guard';

const routes: Routes = [
  { path: 'phaseTesterResponse', component: PhaseTesterResponseComponent, canActivate: [AuthGuard]}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PhaseTesterResponseRoutingModule { }
