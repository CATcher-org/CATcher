import { pipe } from 'rxjs';
import { throwIfFalse } from '../../shared/lib/custom-ops';

export interface SessionData {
  openPhases: string[];
  phaseBugReporting: string;
  phaseTeamResponse: string;
  phaseTesterResponse: string;
  phaseModeration: string;
}

export const SESSION_DATA_UNAVAILABLE = 'Session Data Unavailable';
export const SESSION_DATA_INCORRECTLY_DEFINED = 'Session Data is Incorrectly Defined';
export const NO_ACCESSIBLE_PHASES = 'There are no accessible phases';

export function assertSessionDataIntegrity() {
  return pipe(
    throwIfFalse(sessionData => sessionData !== undefined,
      () => new Error(SESSION_DATA_UNAVAILABLE)),
    throwIfFalse(isSessionDataCorrectlyDefined,
      () => new Error(SESSION_DATA_INCORRECTLY_DEFINED)),
    throwIfFalse(hasOpenPhases,
      () => new Error(NO_ACCESSIBLE_PHASES)));
}

/**
 * Ensures that the input session Data has been correctly defined.
 * Returns true if satisfies these properties, false otherwise.
 * @param sessionData
 */
function isSessionDataCorrectlyDefined(sessionData: SessionData): boolean {
  return checkForUndefinedData(sessionData);
}

function checkForUndefinedData(sessionData: SessionData): boolean {
  for (const data of Object.values(sessionData)) {
    if (data === undefined || data === '') {
      return false;
    }
  }
  return true;
}

function hasOpenPhases(sessionData: SessionData): boolean {
  return sessionData.openPhases.length !== 0;
}
