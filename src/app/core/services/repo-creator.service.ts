import { Injectable } from '@angular/core';
import { flatMap } from 'rxjs/operators';
import { Observable, of, pipe, UnaryFunction } from 'rxjs';
import { GithubService } from './github.service';
import { UserService } from './user.service';
import { Phase } from '../models/phase.model';
import { UserRole } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class RepoCreatorService {
  constructor(
    private githubService: GithubService,
    private userService: UserService
  ) {}

  /**
   * Attempted to create the repository if permissions have been given to do so.
   * @param currentPhase the current phase of the session.
   * @param phaseRepo the name of the specified repository.
   */
  public attemptRepoCreation(currentPhase: Phase, phaseRepo: string):
    UnaryFunction<Observable<boolean | null>, Observable<boolean | null>> {
    return pipe(
      flatMap((sessionFixPermission: boolean | null) => {
        if (sessionFixPermission === null) {
          // No Session Fix Necessary
          return of(null);
        } else if (sessionFixPermission) {
          return this.attemptSessionAvailabilityFix(currentPhase, phaseRepo);
        } else {
          throw new Error('You cannot proceed without the required repository.');
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
 private attemptSessionAvailabilityFix(currentPhase: Phase, phaseRepo: string): Observable<any> {
   if (currentPhase !== Phase.phaseBugReporting) {
     throw new Error('Current Phase\'s Repository has not been opened.');
   } else if (currentPhase === Phase.phaseBugReporting && this.userService.currentUser.role !== UserRole.Student) {
     throw new Error('Bug-Reporting Phase\'s repository initialisation is only available to Students.');
   }
   this.githubService.createRepository(phaseRepo);

   return new Observable(subscriber => {
     setTimeout(() => subscriber.next(true), 1000);
   });
 }
}
