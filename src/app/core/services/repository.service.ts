import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { Observable, pipe, UnaryFunction } from 'rxjs';
import { GithubService } from './github.service';
import { LabelService } from './label.service';
import { UserService } from './user.service';
import { throwIfFalse } from '../../shared/lib/custom-ops';

export const SESSION_AVALIABILITY_FIX_FAILED = 'Session Availability Fix failed.';

@Injectable({
  providedIn: 'root',
})
export class RepositoryService {
  constructor(
    private githubService: GithubService,
    private labelService: LabelService,
    private userService: UserService
  ) {}

  /**
   * Returns an custom operator which checks if the session had been created
   * either naturally or using a fix. 
   * If true, returns a call to synchronise the labels in our application 
   * with the remote repository. Else, throw an error. 
   */ 
  syncLabels(): UnaryFunction<Observable<boolean>, Observable<any>> {
    return pipe(
      throwIfFalse(
        (isSessionCreated: boolean) => isSessionCreated,
        () => new Error(SESSION_AVALIABILITY_FIX_FAILED)
      ),
      map(() => this.labelService.synchronizeRemoteLabels())
    );
  }
}
