import { RepoCreatorService } from '../../src/app/core/services/repo-creator.service';
import { of } from 'rxjs';

const phaseOwner = 'CATcher-org';
const phaseRepo = 'bugreporting';
let repoCreatorService: RepoCreatorService;
let githubService: any;

describe('RepoCreatorService', () => {
  beforeEach(() => {
    githubService = jasmine.createSpyObj('GithubService', ['isRepositoryPresent']);
    repoCreatorService = new RepoCreatorService(githubService);
  });

  describe('.verifyRepoCreation)_', () => {
    it('should not need to check the prescence of the repository if no fix was done', () => {
      of(null)
        .pipe(repoCreatorService.verifyRepoCreation(phaseOwner, phaseRepo))
        .subscribe();

      expect(githubService.isRepositoryPresent).not.toHaveBeenCalled();
    });

    it('should check the prescence of the repository if a fix was done', () => {
      githubService.isRepositoryPresent.and.callFake(() => of(true));
      of(true)
        .pipe(repoCreatorService.verifyRepoCreation(phaseOwner, phaseRepo))
        .subscribe();

      expect(githubService.isRepositoryPresent).toHaveBeenCalledTimes(1);
    });

    it('should not need to check the prescence of the repository if the fix failed', () => {
      of(false)
        .pipe(repoCreatorService.verifyRepoCreation(phaseOwner, phaseRepo))
        .subscribe();

      expect(githubService.isRepositoryPresent).not.toHaveBeenCalled();
    });
  });
});
