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
   * Checks if the necessary repository has been created.
   */
  public verifyRepoCreation(phaseOwner: string, phaseRepo: string): UnaryFunction<Observable<boolean | null>, Observable<boolean>> {
    return pipe(
      flatMap((isFixAttempted: boolean | null) => {
        if (isFixAttempted === null) {
          // If no fix has been attempted, there is no need to verify fix outcome.
          return of(true);
        } else if (isFixAttempted) {
          // Verify that Repository has been created if a fix attempt has occurred.
          return this.verifySessionAvailability(phaseOwner, phaseRepo);
        }
      })
    );
  }

  /**
   * Checks if the necessary repository is available and creates it if the permissions are available.
   * @param phaseOwner Owner of Specified Repository.
   * @param phaseRepo Name of Repository.
   */
  private verifySessionAvailability(phaseOwner: string, phaseRepo: string): Observable<boolean> {
    return this.githubService.isRepositoryPresent(phaseOwner, phaseRepo);
  }

}

