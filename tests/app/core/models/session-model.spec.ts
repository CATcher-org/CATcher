import {
  assertSessionDataIntegrity,
  SessionData,
  SESSION_DATA_INCORRECTLY_DEFINED,
  SESSION_DATA_UNAVAILABLE,
  NO_ACCESSIBLE_PHASES,
} from '../../../../src/app/core/models/session.model';
import { Phase } from '../../../../src/app/core/services/phase.service';
import { of } from 'rxjs';

const validSessionData: SessionData = {
  openPhases: [
    Phase.phaseBugReporting,
    Phase.phaseTeamResponse,
    Phase.phaseTesterResponse,
    Phase.phaseModeration,
  ],
  phaseBugReporting: 'bugreporting',
  phaseTeamResponse: 'pe-results',
  phaseTesterResponse: 'testerresponse',
  phaseModeration: 'pe-evaluation',
};

describe('Session Model', () => {
  describe('assertSessionDataIntegrity()', () => {
    it('should throw error on unavailable session', () => {
      of(undefined)
        .pipe(assertSessionDataIntegrity())
        .subscribe({
          error: (err) =>
            expect(err).toEqual(new Error(SESSION_DATA_UNAVAILABLE)),
        });
    });

    it('should throw error on session data with missing values', () => {
      of({ key: '' })
        .pipe(assertSessionDataIntegrity())
        .subscribe({
          error: (err) =>
            expect(err).toEqual(new Error(SESSION_DATA_INCORRECTLY_DEFINED)),
        });
      of({ key: undefined })
        .pipe(assertSessionDataIntegrity())
        .subscribe({
          error: (err) =>
            expect(err).toEqual(new Error(SESSION_DATA_INCORRECTLY_DEFINED)),
        });
    });

    it('should throw error on session with no open phases', () => {
      of({ openPhases: [] })
        .pipe(assertSessionDataIntegrity())
        .subscribe({
          error: (err) => expect(err).toEqual(new Error(NO_ACCESSIBLE_PHASES)),
        });
    });

    it('should pass valid session data', () => {
      of(validSessionData)
        .pipe(assertSessionDataIntegrity())
        .subscribe((el) => expect(el).toEqual(validSessionData));
    });
  });
});
