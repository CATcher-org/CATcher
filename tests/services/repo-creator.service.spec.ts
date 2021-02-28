import { RepoCreatorService } from '../../src/app/core/services/repo-creator.service';
import { of } from 'rxjs';

const PHASE_OWNER = 'CATcher-org';
const PHASE_REPO = 'bugreporting';
let repoCreatorService: RepoCreatorService;
let githubService: any;

describe('RepoCreatorService', () => {
  beforeEach(() => {
    githubService = jasmine.createSpyObj('GithubService', ['isRepositoryPresent']);
    repoCreatorService = new RepoCreatorService(githubService);
  });

  describe('.verifyRepoCreation()', () => {
    it('should not need to check the prescence of the repository if no fix was done', () => {
      of(null)
        .pipe(repoCreatorService.verifyRepoCreation(PHASE_OWNER, PHASE_REPO))
        .subscribe();

      expect(githubService.isRepositoryPresent).not.toHaveBeenCalled();
    });

    it('should check the prescence of the repository if a fix was done', () => {
      githubService.isRepositoryPresent.and.callFake(() => of(true));
      of(true)
        .pipe(repoCreatorService.verifyRepoCreation(PHASE_OWNER, PHASE_REPO))
        .subscribe();

      expect(githubService.isRepositoryPresent).toHaveBeenCalled();
    });
  });
});
