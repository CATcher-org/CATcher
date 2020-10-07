import { pipe } from 'rxjs';
import { throwIfFalse } from '../../shared/lib/custom-ops';

export interface SessionData {
  openPhases: string[];
  phaseBugReporting: string;
  phaseTeamResponse: string;
  phaseTesterResponse: string;
  phaseModeration: string;
}

export function assertSessionDataIntegrity() {
  return pipe(
    throwIfFalse(sessionData => sessionData !== undefined,
      () => new Error('Session Data Unavailable')),
    throwIfFalse(isSessionDataCorrectlyDefined,
      () => new Error('Session Data is Incorrectly Defined')),
    throwIfFalse(hasOpenPhases,
      () => new Error('There are no accessible phases.')));
}

/**
 * Ensures that the input session Data has been correctly defined.
 * Returns true if satisfies these properties, false otherwise.
 * @param sessionData
 */
function isSessionDataCorrectlyDefined(sessionData: SessionData): boolean {
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
