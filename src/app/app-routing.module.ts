import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthModule } from './auth/auth.module';
import { AuthGuard } from './core/guards/auth.guard';
import { PhaseBugReportingModule } from './phase-bug-reporting/phase-bug-reporting.module';
import { PhaseModerationModule } from './phase-moderation/phase-moderation.module';
import { PhaseTeamResponseModule } from './phase-team-response/phase-team-response.module';
import { PhaseTesterResponseModule } from './phase-tester-response/phase-tester-response.module';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => {
      return AuthModule;
    }
  },
  {
    path: 'phaseBugReporting',
    loadChildren: () => {
      return PhaseBugReportingModule;
    },
    canLoad: [AuthGuard]
  },
  {
    path: 'phaseTeamResponse',
    loadChildren: () => {
      return PhaseTeamResponseModule;
    },
    canLoad: [AuthGuard]
  },
  {
    path: 'phaseTesterResponse',
    loadChildren: () => {
      return PhaseTesterResponseModule;
    },
    canLoad: [AuthGuard]
  },
  {
    path: 'phaseModeration',
    loadChildren: () => {
      return PhaseModerationModule;
    },
    canLoad: [AuthGuard]
  },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
