import {
  assertSessionDataIntegrity,
  NO_ACCESSIBLE_PHASES,
  NO_VALID_OPEN_PHASES,
  OPENED_PHASE_REPO_UNDEFINED,
  SessionData,
  SESSION_DATA_UNAVAILABLE,
  SESSION_DATA_MISSING_CRUCIAL_INFO
} from '../../../../src/app/core/models/session.model';
import { Phase } from '../../../../src/app/core/models/phase.model';
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

    it('should throw error on session data with missing crucial values', () => {
      of({ dummyKey: undefined })
        .pipe(assertSessionDataIntegrity())
        .subscribe({
          next: () => fail(),
          error: (err) => expect(err).toEqual(new Error(SESSION_DATA_MISSING_CRUCIAL_INFO)),
        });
    });

    it('should throw error on session with no open phases', () => {
      of({ openPhases: [] })
        .pipe(assertSessionDataIntegrity())
        .subscribe({
          error: (err) => expect(err).toEqual(new Error(NO_ACCESSIBLE_PHASES)),
        });
    });

    it('should throw error on session data with invalid open phases', () => {
      of({ ...validSessionData, openPhases: ['unknownPhase'] })
        .pipe(assertSessionDataIntegrity())
        .subscribe({
          next: () => fail(),
          error: (err) => expect(err).toEqual(new Error(NO_VALID_OPEN_PHASES)),
        });
    });

    it('should throw error on session data with undefined repo for open phase', () => {
      const modifiedSessionData: SessionData = { ...validSessionData, openPhases: [Phase.phaseBugReporting] };
      of({ ...modifiedSessionData, phaseBugReporting: undefined })
        .pipe(assertSessionDataIntegrity())
        .subscribe({
          next: () => fail(),
          error: (err) => expect(err).toEqual(new Error(OPENED_PHASE_REPO_UNDEFINED)),
        });
      of({ ...modifiedSessionData, phaseBugReporting: null })
        .pipe(assertSessionDataIntegrity())
        .subscribe({
          next: () => fail(),
          error: (err) => expect(err).toEqual(new Error(OPENED_PHASE_REPO_UNDEFINED)),
        });
      of({ ...modifiedSessionData, phaseBugReporting: '' })
        .pipe(assertSessionDataIntegrity())
        .subscribe({
          next: () => fail(),
          error: (err) => expect(err).toEqual(new Error(OPENED_PHASE_REPO_UNDEFINED)),
        });
    });

    it('should not throw error if session data contains repo information of unopened phases', () => {
      const modifiedSessionData: SessionData = { ...validSessionData, openPhases: [Phase.phaseBugReporting] };
      of({ ...modifiedSessionData })
        .pipe(assertSessionDataIntegrity())
        .subscribe({
          next: (el) => expect(el).toEqual(modifiedSessionData),
          error: () => fail(),
        });
    });

    it('should pass valid session data', () => {
      of(validSessionData)
        .pipe(assertSessionDataIntegrity())
        .subscribe((el) => expect(el).toEqual(validSessionData));
    });
  });
});
