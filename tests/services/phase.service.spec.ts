import { of } from 'rxjs';
import { SessionData } from '../../src/app/core/models/session.model';
import { Phase, PhaseService } from '../../src/app/core/services/phase.service';

const moderationPhaseSettingsFile: {} = {
  'openPhases': [Phase.phaseModeration],
  [Phase.phaseBugReporting]: 'bugreporting',
  [Phase.phaseTeamResponse]: 'pe-results',
  [Phase.phaseTesterResponse]: 'testerresponse',
  [Phase.phaseModeration]: 'pe-evaluation'
};

const invalidPhasesSettingsFile: {} = {
  ...moderationPhaseSettingsFile,
  'openPhases': ['dummyPhase']
};

const multipleOpenPhasesSettingsFile: {} = {
  ...moderationPhaseSettingsFile,
  'openPhases': [Phase.phaseBugReporting, Phase.phaseTeamResponse]
};

let phaseService: PhaseService;
let githubService: any;

describe('PhaseService', () => {
  beforeEach(() => {
    githubService = jasmine.createSpyObj('GithubService',
      ['fetchSettingsFile', 'storePhaseDetails']);
    phaseService = new PhaseService(null, githubService, null, null, null);
  });

  describe('.storeSessionData()', () => {
    it('should return an Observable of true if an openPhase is defined', () => {
      githubService.fetchSettingsFile.and.returnValue(of(moderationPhaseSettingsFile));
      phaseService.storeSessionData().subscribe((result: boolean) => {
        expect(result).toBeTrue();
      });
    });

    it('should return an Observable of true if multiple openPhases are defined', () => {
      githubService.fetchSettingsFile.and.returnValue(of(multipleOpenPhasesSettingsFile));
      phaseService.storeSessionData().subscribe((result: boolean) => {
        expect(result).toBeTrue();
      });
    });

    it('should return an Observable of false if no openPhases are defined', () => {
      githubService.fetchSettingsFile.and.returnValue(of(invalidPhasesSettingsFile));
      phaseService.storeSessionData().subscribe((result: boolean) => {
        expect(result).toBeFalse();
      });
    });
  });

  describe('.githubRepoPermissionLevel()', () => {
    it('should return "repo" if phaseModeration is included in openPhases', () => {
      phaseService.sessionData = moderationPhaseSettingsFile as SessionData;
      expect(phaseService.sessionData.openPhases).toContain(Phase.phaseModeration);
      expect(phaseService.githubRepoPermissionLevel()).toEqual('repo');
    });

    it('should return "public_repo" if phaseModeration is not included in openPhases', () => {
      phaseService.sessionData = {
        ...moderationPhaseSettingsFile,
        openPhases: []
      } as SessionData;
      expect(phaseService.sessionData.openPhases).not.toContain(Phase.phaseModeration);
      expect(phaseService.githubRepoPermissionLevel()).toEqual('public_repo');
    });
  });

  describe('.reset()', () => {
    it('should reset the currentPhase of the PhaseService', () => {
      phaseService.currentPhase = Phase.phaseBugReporting;
      phaseService.reset();
      expect(phaseService.currentPhase).toBeNull();
    });
  });
});
