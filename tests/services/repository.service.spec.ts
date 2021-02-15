import { of } from 'rxjs';
import { RepositoryService, SESSION_AVALIABILITY_FIX_FAILED } from '../../src/app/core/services/repository.service';


let repositoryService: RepositoryService;
let labelService: any;

describe('RepositoryService', () => {
  beforeEach(() => {
    labelService = jasmine.createSpyObj('GithubService', ['synchronizeRemoteLabels']);
    repositoryService = new RepositoryService(null, labelService, null);
  });

  describe('.syncLabels()', () => {
    it('should throw an error given an Observable of false', () => {
      of(false)
        .pipe(repositoryService.syncLabels())
        .subscribe({
          error: (err) =>
            expect(err).toEqual(new Error(SESSION_AVALIABILITY_FIX_FAILED)),
        });
    });

    it('should return the result of labelService.synchronizeRemoteLabels() given an Observable of true', () => {
      labelService.synchronizeRemoteLabels.and.callFake(() => []);
      of(true)
        .pipe(repositoryService.syncLabels())
        .subscribe((result: {}[]) => expect(result).toEqual([]));
    });
  });
});
