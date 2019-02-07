import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TutorComponent } from './tutor.component';
import { SecondPhaseTutorComponent } from './second-phase-tutor/second-phase-tutor.component';
import {AuthGuard} from '../auth/auth.guard';


const routes: Routes = [
  { path: 'tutor', component: TutorComponent, canActivate: [AuthGuard]},
  { path: 'tutor-second-phase', component: SecondPhaseTutorComponent, canActivate: [AuthGuard]},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TutorRoutingModule {}
