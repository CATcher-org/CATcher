import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PhaseBugReportingModule } from '../phase-bug-reporting/phase-bug-reporting.module';
import { PhaseModerationModule } from '../phase-moderation/phase-moderation.module';
import { PhaseTeamResponseModule } from '../phase-team-response/phase-team-response.module';
import { PhaseTesterResponseModule } from '../phase-tester-response/phase-tester-response.module';

const routes: Routes = [
  { path: 'phaseBugReporting', loadChildren: () => PhaseBugReportingModule },
  { path: 'phaseTeamResponse', loadChildren: () => PhaseTeamResponseModule },
  { path: 'phaseTesterResponse', loadChildren: () => PhaseTesterResponseModule },
  { path: 'phaseModeration', loadChildren: () => PhaseModerationModule }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PreviewerRoutingModule {}
