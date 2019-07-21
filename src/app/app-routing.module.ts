import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthModule} from './auth/auth.module';
import { Phase1Module } from './phase1/phase1.module';
import { Phase2Module } from './phase2/phase2.module';
import { PhaseModerationModule } from './phase-moderation/phase-moderation.module';
import { AuthGuard } from './core/guards/auth.guard';
import { PhaseTesterResponseModule } from './phase-tester-response/phase-tester-response.module';

const routes: Routes = [
  { path: '', loadChildren: () => AuthModule},
  { path: 'phase1', loadChildren: () => Phase1Module, canLoad: [AuthGuard]},
  { path: 'phase2', loadChildren: () => Phase2Module, canLoad: [AuthGuard]},
  { path: 'phaseTesterResponse', loadChildren: () => PhaseTesterResponseModule, canLoad: [AuthGuard]},
  { path: 'phaseModeration', loadChildren: () => PhaseModerationModule, canLoad: [AuthGuard]},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
