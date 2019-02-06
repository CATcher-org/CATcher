import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TutorComponent } from './tutor.component';
import {AuthGuard} from '../auth/auth.guard';


const routes: Routes = [
  { path: 'tutor', component: TutorComponent, canActivate: [AuthGuard]},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TutorRoutingModule {}
