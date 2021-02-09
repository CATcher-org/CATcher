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
const SESSION_DATA_MISSING_CRUCIAL_INFO = 'Session Data is missing crucial components';
export const NO_ACCESSIBLE_PHASES = 'There are no accessible phases';
export const SESSION_DATA_INCORRECTLY_DEFINED = 'Session Data is Incorrectly Defined';


export function assertSessionDataIntegrity() {
  return pipe(
    throwIfFalse(sessionData => sessionData !== undefined,
      () => new Error(SESSION_DATA_UNAVAILABLE)),
    throwIfFalse(isRequiredFieldsPresent,
      () => new Error(SESSION_DATA_MISSING_CRUCIAL_INFO)),
    throwIfFalse(hasOpenPhases,
      () => new Error(NO_ACCESSIBLE_PHASES)),
    throwIfFalse(isSessionDataCorrectlyDefined,
      () => new Error(SESSION_DATA_INCORRECTLY_DEFINED)),
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
 * Ensures that the input session Data has been correctly defined.
 * Returns true if satisfies these properties, false otherwise.
 * @param sessionData
 */
function isSessionDataCorrectlyDefined(sessionData: SessionData): boolean {
  return isOpenPhasesValid(sessionData);
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

function hasOpenPhases(sessionData: SessionData): boolean {
  return sessionData.openPhases.length !== 0;
}
