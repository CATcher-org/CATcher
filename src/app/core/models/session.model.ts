import { pipe } from 'rxjs';
import { throwIfFalse } from '../../shared/lib/custom-ops';
import { Phase } from './phase.model';

export interface SessionData {
  openPhases: Phase[];
  [Phase.phaseBugReporting]: string;
  [Phase.phaseTeamResponse]: string;
  [Phase.phaseTesterResponse]: string;
  [Phase.phaseModeration]: string;
}

export const SESSION_DATA_UNAVAILABLE = 'Session Data Unavailable';
export const SESSION_DATA_MISSING_CRUCIAL_INFO = 'Session Data is missing crucial components';
export const NO_ACCESSIBLE_PHASES = 'There are no accessible phases';
export const NO_VALID_OPEN_PHASES = 'Invalid Open Phases detected';
export const OPENED_PHASE_REPO_UNDEFINED = 'Opened Phase has no repo defined';

export function assertSessionDataIntegrity() {
  return pipe(
    throwIfFalse(sessionData => sessionData !== undefined,
      () => new Error(SESSION_DATA_UNAVAILABLE)),
    throwIfFalse(isRequiredFieldsPresent,
      () => new Error(SESSION_DATA_MISSING_CRUCIAL_INFO)),
    throwIfFalse(hasOpenPhases,
      () => new Error(NO_ACCESSIBLE_PHASES)),
    throwIfFalse(isOpenPhasesValid,
      () => new Error(NO_VALID_OPEN_PHASES)),
    throwIfFalse(isOpenPhasesRepoDefined,
      () => new Error(OPENED_PHASE_REPO_UNDEFINED)),
  );
}

/**
 * Checks if Session Data has all its crucial fields present.
 * @param sessionData
 */
function isRequiredFieldsPresent(sessionData: SessionData): boolean {
  return sessionData.openPhases != null;
}

/**
 * Checks if Open Phases belong to a pre-defined Phase.
 * @param sessionData
 */
function isOpenPhasesValid(sessionData: SessionData): boolean {
  return sessionData.openPhases.reduce((isOpenPhasesValidSoFar: boolean, currentOpenPhase: string) =>
    isOpenPhasesValidSoFar && currentOpenPhase in Phase,
    true);
}

/**
 * Checks if each stated Open Phase has an associated repo defined as well.
 * @param sessionData
 */
function isOpenPhasesRepoDefined(sessionData: SessionData): boolean {
  return sessionData.openPhases.reduce((isOpenPhasesRepoDefinedSoFar: boolean, currentOpenPhase: string) =>
    isOpenPhasesRepoDefinedSoFar && !!sessionData[currentOpenPhase],
    true);
}

function hasOpenPhases(sessionData: SessionData): boolean {
  return sessionData.openPhases.length !== 0;
}
