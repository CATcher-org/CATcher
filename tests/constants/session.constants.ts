import { Phase } from '../../src/app/core/models/phase.model';
import { SessionData } from '../../src/app/core/models/session.model';

export const MODERATION_PHASE_SESSION_DATA: SessionData = {
  openPhases: [Phase.phaseModeration],
  [Phase.phaseBugReporting]: 'bugreporting',
  [Phase.phaseTeamResponse]: 'pe-results',
  [Phase.phaseTesterResponse]: 'testerresponse',
  [Phase.phaseModeration]: 'pe-evaluation'
};

export const NO_OPEN_PHASES_SESSION_DATA: SessionData = {
  ...MODERATION_PHASE_SESSION_DATA,
  openPhases: []
};

export const MULTIPLE_OPEN_PHASES_SESSION_DATA: SessionData = {
  ...MODERATION_PHASE_SESSION_DATA,
  openPhases: [
    Phase.phaseBugReporting,
    Phase.phaseTeamResponse,
    Phase.phaseTesterResponse,
    Phase.phaseModeration,
  ]
};
