import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { flatMap, map, retry, tap } from 'rxjs/operators';
import { Observable, of, pipe } from 'rxjs';
import { GithubService } from './github.service';
import { LabelService } from './label.service';
import { UserService } from './user.service';
import { SessionData, assertSessionDataIntegrity } from '../models/session.model';
import { MatDialog } from '@angular/material';
import { SessionFixConfirmationComponent } from './session-fix-confirmation/session-fix-confirmation.component';
import { Phase } from '../models/phase.model';
import { throwIfFalse } from '../../shared/lib/custom-ops';
import { RepoCreatorService } from './repo-creator.service';

export const SESSION_AVALIABILITY_FIX_FAILED = 'Session Availability Fix failed.';

export const PhaseDescription = {
  [Phase.phaseBugReporting]: 'Bug Reporting Phase',
  [Phase.phaseTeamResponse]: 'Team\'s Response Phase',
  [Phase.phaseTesterResponse]: 'Tester\'s Response Phase',
  [Phase.phaseModeration]: 'Moderation Phase'
};

@Injectable({
  providedIn: 'root',
})
export class PhaseService {

  public currentPhase: Phase;
  private repoName: string;
  private orgName: string;

  public sessionData: SessionData;

  private phaseRepoOwners = {
    phaseBugReporting: '',
    phaseTeamResponse: '',
    phaseTesterResponse: '',
    phaseModeration: ''
  };

  constructor(private http: HttpClient,
              private githubService: GithubService,
              private labelService: LabelService,
              private userService: UserService,
              private repoCreatorService: RepoCreatorService,
              public phaseFixConfirmationDialog: MatDialog) {}
  /**
   * Stores the location of the repositories belonging to
   * each phase of the application.
   * @param org - name of organization.
   * @param user - name of user.
   */
  setPhaseOwners(org: string, user: string): void {
    this.orgName = org;
    this.phaseRepoOwners.phaseBugReporting = user;
    this.phaseRepoOwners.phaseTeamResponse = org;
    this.phaseRepoOwners.phaseTesterResponse = user;
    this.phaseRepoOwners.phaseModeration = org;
  }

  /**
   * Returns the name of the owner of a given phase.
   * @param phase
   */
  getPhaseOwner(phase: string): string {
    return this.phaseRepoOwners[phase];
  }

  fetchSessionData(): Observable<SessionData> {
    return this.githubService.fetchSettingsFile().pipe(
      map(data => data as SessionData)
    );
  }

  /**
   * Will fetch session data and update phase service with it.
   * @returns - If the session is valid return true, else false
   */
  storeSessionData(): Observable<boolean> {
    return this.fetchSessionData().pipe(
      assertSessionDataIntegrity(),
      map((sessionData: SessionData) => {
        this.updateSessionParameters(sessionData);
        return this.currentPhase !== undefined;
      })
    );
  }

  /**
   * Determines the github's level of repo permission required for the phase.
   * Ref: https://developer.github.com/apps/building-oauth-apps/understanding-scopes-for-oauth-apps/#available-scopes
   */
  githubRepoPermissionLevel(): string {
    if (this.sessionData.openPhases.includes(Phase.phaseModeration)) {
      return 'repo';
    } else {
      return 'public_repo';
    }
  }

  /**
   * Checks if the necessary repository is available and creates it if the permissions are available.
   * @param sessionData
   */
  verifySessionAvailability(sessionData: SessionData): Observable<boolean> {
    return this.githubService.isRepositoryPresent(this.phaseRepoOwners[this.currentPhase], sessionData[this.currentPhase]);
  }

  /**
   * Stores session data and sets current session's phase.
   * @param sessionData
   */
  updateSessionParameters(sessionData: SessionData) {
    this.sessionData = sessionData;
    this.currentPhase = Phase[sessionData.openPhases[0]];
    this.repoName = sessionData[sessionData.openPhases[0]];
    this.githubService.storePhaseDetails(this.phaseRepoOwners[this.currentPhase], this.repoName);
  }

  /**
   * Launches the SessionFixConfirmation Dialog.
   * @return Observable<boolean> - Representing user's permission grant.
   */
  openSessionFixConfirmation(): Observable<boolean> {
    const dialogRef = this.phaseFixConfirmationDialog.open(SessionFixConfirmationComponent, {
      data: {user: this.userService.currentUser.loginId, repoName: this.sessionData[this.currentPhase]}
    });

    return dialogRef.afterClosed();
  }


  /**
   * Ensures that the necessary data for the current session is available
   * and synchronized with the remote server.
   */
  sessionSetup(): Observable<any> {
    // Permission Caching Mechanism to prevent repeating permission request.
    let isSessionFixPermissionGranted = false;
    const cacheSessionFixPermission = () => {
      return pipe(
        tap((sessionFixPermission: boolean | null) => {
          isSessionFixPermissionGranted = sessionFixPermission ? sessionFixPermission : false;
        })
      );
    };

    return this.fetchSessionData().pipe(
      assertSessionDataIntegrity(),
      flatMap((sessionData: SessionData) => {
        this.updateSessionParameters(sessionData);
        return this.verifySessionAvailability(sessionData);
      }),
      flatMap((isSessionAvailable: boolean) => {
        if (!isSessionAvailable && this.currentPhase === Phase.phaseBugReporting) {
          if (isSessionFixPermissionGranted) {
            return of(true);
          }
          return this.openSessionFixConfirmation();
        } else {
          return of(null);
        }
      }),
      cacheSessionFixPermission(),
      this.repoCreatorService.verifyRepoCreationPermissions(this.currentPhase),
      this.repoCreatorService.attemptRepoCreation(this.sessionData[this.currentPhase]),
      this.repoCreatorService.verifyRepoCreation(this.getPhaseOwner(this.currentPhase), this.sessionData[this.currentPhase]),
      throwIfFalse(
        (isSessionCreated: boolean) => isSessionCreated,
        () => new Error(SESSION_AVALIABILITY_FIX_FAILED)),
      this.labelService.syncLabels(),
      retry(1)  // Retry once, to handle edge case where GitHub API cannot immediately confirm existence of the newly created repo.
    );
  }

  public getPhaseDetail() {
    return this.orgName.concat('/').concat(this.repoName);
  }

  reset() {
    this.currentPhase = null;
  }

}
