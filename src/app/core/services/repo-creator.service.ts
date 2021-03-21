import { Injectable } from '@angular/core';
import { flatMap } from 'rxjs/operators';
import { Observable, of, pipe, UnaryFunction } from 'rxjs';
import { GithubService } from './github.service';
import { UserService } from './user.service';
import { Phase } from '../models/phase.model';
import { UserRole } from '../models/user.model';

export const MISSING_REQUIRED_REPO = 'You cannot proceed without the required repository.';
export const CURRENT_PHASE_REPO_CLOSED = 'Current Phase\'s Repository has not been opened.';
export const BUG_REPORTING_INVALID_ROLE =
  "'Bug-Reporting Phase\'s repository initialisation is only available to Students.'";


@Injectable({
  providedIn: 'root',
})
export class RepoCreatorService {
  constructor(
    private githubService: GithubService,
    private userService: UserService
  ) {}

  /**
   * Attempts to create the repository if permissions have been given to do so.
   * @param currentPhase the current phase of the session.
   * @param phaseRepo the name of the specified repository.
   */
  public attemptRepoCreation(currentPhase: Phase, phaseRepo: string):
    UnaryFunction<Observable<boolean | null>, Observable<boolean | null>> {
    return pipe(
      flatMap((repoCreationPermission: boolean | null) => {
        if (repoCreationPermission === null) {
          // No Session Fix Necessary
          return of(null);
        } else if (repoCreationPermission) {
          return this.triggerRepoCreation(currentPhase, phaseRepo);
        } else {
          throw new Error(MISSING_REQUIRED_REPO);
        }
      })
    );
  }

  /**
   * Checks if the specified repository has been created.
   * @param phaseOwner the user or organization holding the specified repository.
   * @param phaseRepo the name of the specified repository.
   */
  public verifyRepoCreation(phaseOwner: string, phaseRepo: string):
    UnaryFunction<Observable<boolean | null>, Observable<boolean>> {
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

 /**
  * If a Session is unavailable (because the repository is missing) attempt to create IF it is
  * the BugReporting Phase
  * @param currentPhase the current phase of the session.
  * @param phaseRepo the name of the specified repository.
  * @return - Dummy Observable to give the API sometime to propagate the creation of the new repository since
  *           the API Call used here does not return any response.
  */
 private triggerRepoCreation(currentPhase: Phase, phaseRepo: string): Observable<any> {
   if (currentPhase !== Phase.phaseBugReporting) {
     throw new Error(CURRENT_PHASE_REPO_CLOSED);
   } else if (this.userService.currentUser.role !== UserRole.Student) {
     throw new Error(BUG_REPORTING_INVALID_ROLE);
   }
   this.githubService.createRepository(phaseRepo);

   return new Observable(subscriber => {
     setTimeout(() => subscriber.next(true), 1000);
   });
 }
}
