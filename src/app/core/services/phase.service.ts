import {Injectable} from '@angular/core';
import { HttpClient} from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import {GithubService} from './github.service';
import { LabelService } from './label.service';

export enum Phase { phase1 = 'phase1', phase2 = 'phase2', phase3 = 'phase3' }

export interface SessionData {
  openPhases: string[];
  phase1: string;
  phase2: string;
  phase3: string;
}

@Injectable({
  providedIn: 'root',
})
export class PhaseService {

  public currentPhase: Phase;
  private repoName: string;
  private orgName: string;
  public readonly phaseDescription = {
    'phase1': 'Bug Reporting Phase',
    'phase2': 'Team\'s Response Phase',
    'phase3': 'Moderation Phase',
  };
  private sessionData: SessionData;

  private phaseRepoOwners = {
    phase1: '',
    phase2: '',
    phase3: '',
  };

  constructor(private http: HttpClient,
              private github: GithubService,
              private labelService: LabelService) {}

  /**
   * Stores the location of the repositories belonging to
   * each phase of the application.
   * @param org - name of organization.
   * @param user - name of user.
   */
  setPhaseOwners(org: string, user: string): void {
    this.orgName = org;
    this.phaseRepoOwners.phase1 = user;
    this.phaseRepoOwners.phase2 = org;
    this.phaseRepoOwners.phase3 = org;
  }

  fetchSessionData(): Observable<SessionData> {
    return this.github.fetchSettingsFile().pipe(
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
    this.github.storePhaseDetails(this.phaseRepoOwners[this.currentPhase], this.repoName);
  }

  /**
   * Carries out the necessary pre-authentication steps to
   * set up the currently open phase.
   */
  initializeCurrentPhase(): Observable<any> {
    return this.labelService.synchronizeRemoteLabels();
  }

  public getPhaseDetail() {
    return this.orgName.concat('/').concat(this.repoName);
  }

  reset() {
    this.currentPhase = null;
  }

}
