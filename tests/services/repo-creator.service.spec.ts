import { of } from 'rxjs';
import { RepositoryService, SESSION_AVALIABILITY_FIX_FAILED } from '../../src/app/core/services/repo-creator.service';

let repositoryService: RepositoryService;
let githubService: any;

describe('RepositoryService', () => {
  beforeEach(() => {
    githubService = jasmine.createSpyObj('GithubService', ['synchronizeRemoteLabels']);
    repositoryService = new RepositoryService(null, githubService, null);
  });

  describe('.syncLabels()', () => {
    it('should throw an error given an Observable of false', () => {
      of(false)
        .pipe(repositoryService.syncLabels())
        .subscribe({
          next: () => fail(),
          error: (err) => expect(err).toEqual(new Error(SESSION_AVALIABILITY_FIX_FAILED))
        });
    });

    it('should return the result of labelService.synchronizeRemoteLabels() given an Observable of true', () => {
      githubService.synchronizeRemoteLabels.and.callFake(() => []);
      of(true)
        .pipe(repositoryService.syncLabels())
        .subscribe((result: {}[]) => expect(result).toEqual([]));
    });
  });
});
