import { Phase } from '../../src/app/core/models/phase.model';
import { SessionData } from '../../src/app/core/models/session.model';

export const BUG_REPORTING_PHASE_SESSION_DATA: SessionData = {
  openPhases: [Phase.phaseBugReporting],
  [Phase.phaseBugReporting]: 'bugreporting',
  [Phase.phaseBugTrimming]: 'bugtrimming',
  [Phase.phaseTeamResponse]: 'pe-results',
  [Phase.phaseTesterResponse]: 'testerresponse',
  [Phase.phaseModeration]: 'pe-evaluation'
};

export const MODERATION_PHASE_SESSION_DATA: SessionData = {
  ...BUG_REPORTING_PHASE_SESSION_DATA,
  openPhases: [Phase.phaseModeration]
};

export const NO_OPEN_PHASES_SESSION_DATA: SessionData = {
  ...BUG_REPORTING_PHASE_SESSION_DATA,
  openPhases: []
};

export const MULTIPLE_OPEN_PHASES_SESSION_DATA: SessionData = {
  ...BUG_REPORTING_PHASE_SESSION_DATA,
  openPhases: [Phase.phaseBugReporting, Phase.phaseBugTrimming, Phase.phaseTeamResponse, Phase.phaseTesterResponse, Phase.phaseModeration]
};
