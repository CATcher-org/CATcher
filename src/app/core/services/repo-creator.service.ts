import { Injectable } from '@angular/core';
import { flatMap } from 'rxjs/operators';
import { Observable, of, pipe, UnaryFunction } from 'rxjs';
import { GithubService } from './github.service';

@Injectable({
  providedIn: 'root',
})
export class RepoCreatorService {
  constructor(
    private githubService: GithubService
  ) {}

  /**
   * Checks if the specified repository has been created.
   * @param phaseOwner the user or organization holding the specified repository.
   * @param phaseRepo the name of the specified repository. 
   */
  public verifyRepoCreation(phaseOwner: string, phaseRepo: string): UnaryFunction<Observable<boolean | null>, Observable<boolean>> {
    return pipe(
      flatMap((isFixAttempted: boolean | null) => {
        if (!isFixAttempted) {
          // If no fix has been attempted, there is no need to verify fix outcome.
          return of(true);
        } else {
          // Verify that Repository has been created if a fix attempt has occurred.
          return this.githubService.isRepositoryPresent(phaseOwner, phaseRepo);
        }
      })
    );
  }
}
