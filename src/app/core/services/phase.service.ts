import {Injectable} from '@angular/core';
import { HttpClient} from '@angular/common/http';
import { flatMap, map } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import {GithubService} from './github.service';
import { LabelService } from './label.service';

export enum Phase { phase1 = 'phase1', phase2 = 'phase2', phaseTesterResponse = 'phaseTesterResponse', phaseModeration = 'phaseModeration' }


export interface SessionData {
  openPhases: string[];
  phase1: string;
  phase2: string;
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
    'phase1': 'Bug Reporting Phase',
    'phase2': 'Team\'s Response Phase',
    'phaseTesterResponse': 'Tester\'s Response Phase',
    'phaseModeration': 'Moderation Phase'
  };

  public sessionData: SessionData;

  private phaseRepoOwners = {
    phase1: '',
    phase2: '',
    phaseTesterResponse: '',
    phaseModeration: ''
  };

  constructor(private http: HttpClient,
              private githubService: GithubService,
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
