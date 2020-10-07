import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { flatMap, map } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { GithubService } from './github.service';
import { LabelService } from './label.service';
import { UserService } from './user.service';
import { UserRole } from '../models/user.model';
import { SessionData, assertSessionDataIntegrity } from '../models/session.model';
import { MatDialog } from '@angular/material';
import { SessionFixConfirmationComponent } from './session-fix-confirmation/session-fix-confirmation.component';

export enum Phase {
  phaseBugReporting = 'phaseBugReporting',
  phaseTeamResponse = 'phaseTeamResponse',
  phaseTesterResponse = 'phaseTesterResponse',
  phaseModeration = 'phaseModeration'
}

@Injectable({
  providedIn: 'root',
})
export class PhaseService {

  public currentPhase: Phase;
  private repoName: string;
  private orgName: string;
  public readonly phaseDescription = {
    'phaseBugReporting': 'Bug Reporting Phase',
    'phaseTeamResponse': 'Team\'s Response Phase',
    'phaseTesterResponse': 'Tester\'s Response Phase',
    'phaseModeration': 'Moderation Phase'
  };

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
   * If a Session is unavailable (because the repository is missing) attempt to create IF it is
   * the BugReporting Phase
   * @param sessionData - SessionData containing repository information.
   * @return - Dummy Observable to give the API sometime to propagate the creation of the new repository since
   *           the API Call used here does not return any response.
   */
  attemptSessionAvailabilityFix(sessionData: SessionData): Observable<any> {
    if (this.currentPhase !== Phase.phaseBugReporting) {
      throw new Error('Current Phase\'s Repository has not been opened.');
    } else if (this.currentPhase === Phase.phaseBugReporting && this.userService.currentUser.role !== UserRole.Student) {
      throw new Error('Bug-Reporting Phase\'s repository initialisation is only available to Students.');
    }
    this.githubService.createRepository(sessionData[this.currentPhase]);

    return new Observable(subscriber => {
      setTimeout(() => subscriber.next(true), 1000);
    });
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
    return this.fetchSessionData().pipe(
      assertSessionDataIntegrity(),
      flatMap((sessionData: SessionData) => {
        this.updateSessionParameters(sessionData);
        return this.verifySessionAvailability(sessionData);
      }),
      flatMap((isSessionAvailable: boolean) => {
        if (!isSessionAvailable && this.currentPhase === Phase.phaseBugReporting) {
          return this.openSessionFixConfirmation();
        } else {
          return of(null);
        }
      }),
      flatMap((sessionFixPermission: boolean | null) => {
        if (sessionFixPermission === null) {
          // No Session Fix Necessary
          return of(null);
        } if (sessionFixPermission === true) {
          return this.attemptSessionAvailabilityFix(this.sessionData);
        } else {
          throw new Error('You cannot proceed without the required repository.');
        }
      }),
      flatMap((isFixAttempted: boolean | null) => {
        if (isFixAttempted === null) {
          // If no fix has been attempted, there is no need to verify fix outcome.
          return of(true);
        } else if (isFixAttempted === true) {
          // Verify that Repository has been created if a fix attempt has occurred.
          return this.verifySessionAvailability(this.sessionData);
        }
      }),
      flatMap((isSessionCreated: boolean) => {
        if (!isSessionCreated) {
          throw new Error('Session Availability Fix failed.');
        }
        return this.labelService.synchronizeRemoteLabels();
      })
    );
  }

  public getPhaseDetail() {
    return this.orgName.concat('/').concat(this.repoName);
  }

  reset() {
    this.currentPhase = null;
  }

}
