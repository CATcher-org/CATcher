import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { flatMap, map } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { GithubService } from './github.service';
import { LabelService } from './label.service';
import { UserService } from './user.service';
import { UserRole } from '../models/user.model';
import { ErrorHandlingService } from './error-handling.service';

export enum Phase {
  phaseBugReporting = 'phaseBugReporting',
  phaseTeamResponse = 'phaseTeamResponse',
  phaseTesterResponse = 'phaseTesterResponse',
  phaseModeration = 'phaseModeration'
}


export interface SessionData {
  openPhases: string[];
  phaseBugReporting: string;
  phaseTeamResponse: string;
  phaseTesterResponse: string;
  phaseModeration: string;
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
              private errorHandlingService: ErrorHandlingService) {}

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

  assertSessionDataIntegrity(sessionData: SessionData): void {
    if (sessionData === undefined) {
      throwError('Session Data Unavailable.');
    } else if (!this.isSessionDataCorrectlyDefined(sessionData)) {
      throwError('Session Data is Incorrectly Defined');
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
   */
  attemptSessionAvailabilityFix(sessionData: SessionData) {
    if (this.currentPhase !== Phase.phaseBugReporting) {
      throw new Error('Current Phase\'s Repository has not been opened.');
    } else if (this.currentPhase === Phase.phaseBugReporting && this.userService.currentUser.role !== UserRole.Student) {
      throw new Error('Bug-Reporting Phase\'s repository initialisation is only available to Students.');
    }
    this.githubService.createRepository(sessionData[this.currentPhase]);
  }

  /**
   * Ensures that the input session Data has been correctly defined.
   * Returns true if satisfies these properties, false otherwise.
   * @param sessionData
   */
  isSessionDataCorrectlyDefined(sessionData: SessionData): boolean {
    for (const data of Object.values(sessionData)) {
      if (data === undefined || data === '') {
        return false;
      }
    }
    return true;
  }

  /**
   * Stores session data and sets current session's phase.
   * @throws throwError - If there are no open phases in this session.
   * @param sessionData
   */
  updateSessionParameters(sessionData: SessionData) {
    if (sessionData.openPhases.length === 0) {
      throwError('There are no accessible phases.');
    }

    this.sessionData = sessionData;
    this.currentPhase = Phase[sessionData.openPhases[0]];
    this.repoName = sessionData[sessionData.openPhases[0]];
    this.githubService.storePhaseDetails(this.phaseRepoOwners[this.currentPhase], this.repoName);
  }

  sessionSetup(): Observable<any> {
    return this.fetchSessionData().pipe(
      flatMap((sessionData: SessionData) => {
        this.assertSessionDataIntegrity(sessionData);
        this.updateSessionParameters(sessionData);
        return this.verifySessionAvailability(sessionData);
      }),
      map((isSessionAvailable: boolean) => {
        if (!isSessionAvailable) {
          this.attemptSessionAvailabilityFix(this.sessionData);
        }
      }),
      flatMap(() => {
        // Verify that Repository has been created
        return this.verifySessionAvailability(this.sessionData);
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
