import { of } from 'rxjs';
import { RepoCreatorService, SESSION_AVALIABILITY_FIX_FAILED } from '../../src/app/core/services/repo-creator.service';

let RepoCreatorService: RepoCreatorService;
let githubService: any;

describe('RepoCreatorService', () => {
  beforeEach(() => {
    githubService = jasmine.createSpyObj('GithubService', ['synchronizeRemoteLabels']);
    RepoCreatorService = new RepoCreatorService(null, githubService, null);
  });

  describe('.syncLabels()', () => {
    it('should throw an error given an Observable of false', () => {
      of(false)
        .pipe(RepoCreatorService.syncLabels())
        .subscribe({
          next: () => fail(),
          error: (err) => expect(err).toEqual(new Error(SESSION_AVALIABILITY_FIX_FAILED))
        });
    });

    it('should return the result of labelService.synchronizeRemoteLabels() given an Observable of true', () => {
      githubService.synchronizeRemoteLabels.and.callFake(() => []);
      of(true)
        .pipe(RepoCreatorService.syncLabels())
        .subscribe((result: {}[]) => expect(result).toEqual([]));
    });
  });
});
