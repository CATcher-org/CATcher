import { MISSING_REQUIRED_REPO, RepoCreatorService } from '../../src/app/core/services/repo-creator.service';
import { of } from 'rxjs';
import { UserService } from '../../src/app/core/services/user.service';
import { Phase } from '../../src/app/core/models/phase.model';
import { USER_JUNWEI } from '../constants/data.constants';

const PHASE_OWNER = 'CATcher-org';
const PHASE_REPO = 'bugreporting';
let repoCreatorService: RepoCreatorService;
let githubService: any;
let userService: UserService;

describe('RepoCreatorService', () => {
  beforeEach(() => {
    userService = new UserService(null, null);
    githubService = jasmine.createSpyObj('GithubService', ['isRepositoryPresent', 'createRepository']);
    repoCreatorService = new RepoCreatorService(githubService, userService);
  });

  describe('.verifyRepoCreation()', () => {
    it('should not need to check the presence of the repository if no fix was done', () => {
      of(null).pipe(repoCreatorService.verifyRepoCreation(PHASE_OWNER, PHASE_REPO)).subscribe();

      expect(githubService.isRepositoryPresent).not.toHaveBeenCalled();
    });

    it('should check the presence of the repository if a fix was done', () => {
      githubService.isRepositoryPresent.and.callFake(() => of(true));
      of(true).pipe(repoCreatorService.verifyRepoCreation(PHASE_OWNER, PHASE_REPO)).subscribe();

      expect(githubService.isRepositoryPresent).toHaveBeenCalledWith(PHASE_OWNER, PHASE_REPO);
    });
  });

  describe('.attemptRepoCreation()', () => {
    it('should not need to create the repository if no permissions were needed', () => {
      of(null).pipe(repoCreatorService.attemptRepoCreation(Phase.phaseBugReporting, PHASE_REPO)).subscribe();

      expect(githubService.createRepository).not.toHaveBeenCalled();
    });

    it('should create the repository if permissions were given', () => {
      userService.currentUser = USER_JUNWEI;
      githubService.createRepository.and.callFake(() => of(true));
      of(true).pipe(repoCreatorService.attemptRepoCreation(Phase.phaseBugReporting, PHASE_REPO)).subscribe();

      expect(githubService.createRepository).toHaveBeenCalledWith(PHASE_REPO);
    });

    it('should throw an error if no permissions were given', () => {
      of(false)
        .pipe(repoCreatorService.attemptRepoCreation(Phase.phaseBugReporting, PHASE_REPO))
        .subscribe({
          next: () => fail(),
          error: (err) => expect(err).toEqual(new Error(MISSING_REQUIRED_REPO))
        });

      expect(githubService.createRepository).not.toHaveBeenCalled();
    });
  });
});
