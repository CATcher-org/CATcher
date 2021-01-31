import { assertSessionDataIntegrity } from '../../../../src/app/core/models/session.model';
import { of } from 'rxjs';

const validSessionData = {
  openPhases: [
    'phaseBugReporting',
    'phaseTeamResponse',
    'phaseTesterResponse',
    'phaseModeration',
  ],
  phaseBugReporting: 'bugreporting',
  phaseTeamResponse: 'pe-results',
  phaseTesterResponse: 'testerresponse',
  phaseModeration: 'pe-evaluation',
};

describe('Session Model', () => {
  describe('Assert Session Data Integrity', () => {
    it('should throw error on unavailable session', () => {
      of(undefined)
        .pipe(assertSessionDataIntegrity())
        .subscribe({
          error: (err) =>
            expect(err).toEqual(new Error('Session Data Unavailable')),
        });
    });
    it('should throw error on incorrect session data', () => {
      of({ key: '' })
        .pipe(assertSessionDataIntegrity())
        .subscribe({
          error: (err) =>
            expect(err).toEqual(
              new Error('Session Data is Incorrectly Defined')
            ),
        });
      of({ key: undefined })
        .pipe(assertSessionDataIntegrity())
        .subscribe({
          error: (err) =>
            expect(err).toEqual(
              new Error('Session Data is Incorrectly Defined')
            ),
        });
    });
    it('should throw error on session with no open phases', () => {
      of({ openPhases: [] })
        .pipe(assertSessionDataIntegrity())
        .subscribe({
          error: (err) =>
            expect(err).toEqual(new Error('There are no accessible phases.')),
        });
    });
    it('should pass valid session data', () => {
      of(validSessionData)
        .pipe(assertSessionDataIntegrity())
        .subscribe((el) => expect(el).toEqual(validSessionData));
    });
  });
});
