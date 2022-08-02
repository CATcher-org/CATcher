import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Phase } from '../core/models/phase.model';
import { DataService } from '../core/services/data.service';
import { ErrorHandlingService } from '../core/services/error-handling.service';
import { GithubService } from '../core/services/github.service';
import { GithubEventService } from '../core/services/githubevent.service';
import { IssueService } from '../core/services/issue.service';
import { PhaseService } from '../core/services/phase.service';

@Component({
  selector: 'app-previewer',
  templateUrl: './previewer.component.html',
  styleUrls: ['./previewer.component.css']
})
export class PreviewerComponent implements OnInit {
  phases: string[];
  students: string[];

  constructor(
    private phaseService: PhaseService,
    private githubService: GithubService,
    private githubEventService: GithubEventService,
    private issueService: IssueService,
    private errorHandlingService: ErrorHandlingService,
    private router: Router,
    private dataService: DataService
  ) {
    this.phases = Object.keys(Phase);
  }

  previewInput = new FormGroup({
    selectedPhase: new FormControl(''),
    selectedUsername: new FormControl('')
  });

  ngOnInit(): void {
    this.getAllStudentsInSession().subscribe((students) => (this.students = students));
  }

  handleSubmit(): void {
    const phaseToPreview = this.previewInput.get('selectedPhase').value;
    const username = this.previewInput.get('selectedUsername').value;

    this.routeToSelectedPhase(phaseToPreview, username);
  }

  routeToSelectedPhase(phaseToPreview: string, username: string): void {
    // Set issue service to preview mode
    this.issueService.switchToPreviewMode();

    // Replace Current Phase Data.
    this.phaseService.currentPhase = Phase[phaseToPreview];

    let repoOwner: string;
    if (this.phaseService.currentPhase === Phase.phaseBugReporting || this.phaseService.currentPhase === Phase.phaseTesterResponse) {
      repoOwner = username;
    } else {
      repoOwner = this.phaseService.getPhaseOwner(this.phaseService.currentPhase);
    }

    this.githubService.storePhaseDetails(repoOwner, this.phaseService.sessionData[phaseToPreview]);

    // Remove current phase issues and load selected phase issues.
    this.githubService.reset();
    this.issueService.reset(false);
    this.reload();

    // Route app to new phase.
    this.router.navigateByUrl(this.phaseService.currentPhase);
  }

  getAllStudentsInSession(): Observable<any> {
    return this.dataService.getDataFile().pipe(map((jsonData: {}) => Object.keys(jsonData[DataService.STUDENTS_ALLOCATION])));
  }

  private reload() {
    this.githubEventService.reloadPage().subscribe(
      (success) => success,
      (error) => {
        this.errorHandlingService.handleError(error, () => this.githubEventService.reloadPage());
      }
    );
  }
}
