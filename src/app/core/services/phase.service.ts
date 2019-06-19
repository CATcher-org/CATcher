import {Injectable} from '@angular/core';
import { HttpClient} from '@angular/common/http';
import {catchError, map} from 'rxjs/operators';
import {forkJoin, Observable, of, throwError} from 'rxjs';
import {GithubService} from './github.service';
import {ErrorHandlingService} from './error-handling.service';

export enum Phase { phase1 = 'phase1', phase2 = 'phase2', phase3 = 'phase3' }

export class EncodedData {
  organizationName: string;
  repoInformation: PhaseRepoInformation[] = [];
}

export class PhaseRepoInformation {
  repoName: string;
  repoOwner: string;

  constructor(repoName: string, repoOwner: string) {
    this.repoName = repoName;
    this.repoOwner = repoOwner;
  }
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
  private phaseNum: string;

  constructor(private http: HttpClient,
              private github: GithubService,
              private errorHandlingService: ErrorHandlingService) {}

  parseEncodedPhases(encodedText: String): EncodedData {
    const encodedData = new EncodedData();

    const phase = encodedText.split('@', 4);
    const moduleOrg = phase[0];
    encodedData.organizationName = moduleOrg;

    const phaseOneUrl = phase[1].split('=', 2)[1];
    const phaseTwoUrl = phase[2].split('=', 2)[1];
    const phaseThreeUrl = phase[3].split('=', 2)[1];

    let separator = phaseOneUrl.lastIndexOf('/');
    const repoName = phaseOneUrl.substring(separator + 1);
    let separatorOrg = phaseOneUrl.indexOf('.com');
    const orgName = phaseOneUrl.substring(separatorOrg + 5, separator);
    encodedData.repoInformation.push(new PhaseRepoInformation(repoName, orgName));

    separator = phaseTwoUrl.lastIndexOf('/');
    const repoNameSecond = phaseTwoUrl.substring(separator + 1);
    separatorOrg = phaseTwoUrl.indexOf('.com');
    const orgNameSecond = phaseTwoUrl.substring(separatorOrg + 5, separator);
    encodedData.repoInformation.push(new PhaseRepoInformation(repoNameSecond, orgNameSecond));

    separator = phaseThreeUrl.lastIndexOf('/');
    const repoNameThird = phaseThreeUrl.substring(separator + 1);
    separatorOrg = phaseThreeUrl.indexOf('.com');
    const orgNameThird = phaseThreeUrl.substring(separatorOrg + 5, separator);
    encodedData.repoInformation.push(new PhaseRepoInformation(repoNameThird, orgNameThird));

    return encodedData;
  }

  parseEncodedPhase(encodedText: String): string[] {
    const phase = encodedText.split('@', 4);
    const moduleOrg = phase[0];
    const phaseOneUrl = phase[1].split('=', 2)[1];
    const phaseTwoUrl = phase[2].split('=', 2)[1];
    const phaseThreeUrl = phase[3].split('=', 2)[1];

    let separator = phaseOneUrl.lastIndexOf('/');
    const repoName = phaseOneUrl.substring(separator + 1);

    let separatorOrg = phaseOneUrl.indexOf('.com');
    const orgName = phaseOneUrl.substring(separatorOrg + 5, separator);

    separator = phaseTwoUrl.lastIndexOf('/');
    const repoNameSecond = phaseTwoUrl.substring(separator + 1);
    separatorOrg = phaseTwoUrl.indexOf('.com');
    const orgNameSecond = phaseTwoUrl.substring(separatorOrg + 5, separator);

    separator = phaseThreeUrl.lastIndexOf('/');
    const repoNameThird = phaseThreeUrl.substring(separator + 1);
    separatorOrg = phaseThreeUrl.indexOf('.com');
    const orgNameThird = phaseThreeUrl.substring(separatorOrg + 5, separator);

    return new Array(repoName, orgName, repoNameSecond, orgNameSecond, repoNameThird, orgNameThird, moduleOrg);
  }

  checkIfReposAccessible(array: any): any {

    this.determineCurrentPhaseNumber(this.fetchPhaseAccessibilityData());

    const value = forkJoin(
      this.github.getRepo(array[1], array[0]).pipe(map(res => res), catchError(e => of('Oops'))),
      this.github.getRepo(array[3], array[2]).pipe(map(res => res), catchError(e => of('Oops'))),
      this.github.getRepo(array[5], array[4]).pipe(map(res => res), catchError(e => of('Oops'))),
    ).pipe(
      map(([first, second, third]) => {
        return {first, second, third, array};
      })
    );
    return value;
  }

  fetchPhaseAccessibilityData(): Observable<{}> {
    return this.github.fetchSettingsFile();
  }

  determineCurrentPhaseNumber(accessibilityData: Observable<{}>) {
    accessibilityData.subscribe(data => {
      console.log(data);
      for (const phase in Phase) {
        if (data[phase] === null || data[phase] === 'false') {
          continue;
        }
        this.currentPhase = this.valueToPhase(phase);
        this.phaseNum = this.phaseOrder(this.currentPhase);

        return this.currentPhase;
      }
    });
  }

  valueToPhase(phaseValue: string): Phase {
    switch (phaseValue) {
      case Phase.phase1:
        return Phase.phase1;
      case Phase.phase2:
        return Phase.phase2;
      case Phase.phase3:
        return Phase.phase3;
      default:
        throw new Error('Invalid Phase');
    }
  }

  phaseOrder(phase: Phase): string {
    switch (phase) {
      case Phase.phase1:
        return 'first';
      case Phase.phase2:
        return 'second';
      case Phase.phase3:
        return 'third';
      default:
        throw new Error('Invalid Phase');
    }
  }

  determinePhaseNumber(response: any) {
    let org = '';
    let repo = '';
    let copyUrl = '';
    const moduleOrg = response['array'][6];

    if (response['first']['id'] != null) {
      this.currentPhase = Phase.phase1;
      this.phaseNum = 'first';
    } else if (response['second']['id'] != null) {
      this.currentPhase = Phase.phase2;
      this.phaseNum = 'second';
    } else if (response['third']['id'] != null) {
      this.currentPhase = Phase.phase3;
      this.phaseNum = 'third';
    }
    if (this.currentPhase == null) {
      return ('not accessible');
    } else {
      copyUrl = this.currentPhase;
      org = response[this.phaseNum]['full_name'].split('/', 2)[0];
      repo = response[this.phaseNum]['full_name'].split('/', 2)[1];
      this.github.updatePhaseDetails(repo, org, moduleOrg);
      this.setPhaseDetail(repo, org);
      return (copyUrl);
    }
  }

  private setPhaseDetail(repo: string, org: string) {
    this.repoName = repo;
    this.orgName = org;
  }

  public getPhaseDetail() {
    return this.orgName.concat('/').concat(this.repoName);
  }

  reset() {
    this.currentPhase = null;
  }

}
