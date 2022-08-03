import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { flatMap, map } from 'rxjs/operators';

import { Phase } from '../core/models/phase.model';
import { DataService } from '../core/services/data.service';
import { ErrorHandlingService } from '../core/services/error-handling.service';
import { GithubService } from '../core/services/github.service';
import { GithubEventService } from '../core/services/githubevent.service';
import { IssueService } from '../core/services/issue.service';
import { PhaseService } from '../core/services/phase.service';
import { UserService } from '../core/services/user.service';

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
    private userService: UserService,
    private issueService: IssueService,
    private errorHandlingService: ErrorHandlingService,
    private router: Router,
    private dataService: DataService
  ) {
    this.phases = Object.keys(Phase);
  }

  previewInputForm = new FormGroup({
    selectedPhase: new FormControl('', Validators.required),
    selectedUsername: new FormControl('', Validators.required)
  });

  ngOnInit(): void {
    this.dataService.getAllStudentsInSession().subscribe((students) => (this.students = students));
  }

  handleSubmit(): void {
    const phaseToPreview = this.previewInputForm.get('selectedPhase').value;
    const username = this.previewInputForm.get('selectedUsername').value;

    this.routeToSelectedPhaseAndUsername(phaseToPreview, username);
  }

  routeToSelectedPhaseAndUsername(phaseToPreview: string, username: string): void {
    // Replace current phase data
    this.phaseService.currentPhase = Phase[phaseToPreview];

    // Set GitHub repo to fetch issues from
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

    // Set user model
    this.userService
      .createUserModel(username)
      .pipe(flatMap(() => this.githubEventService.setLatestChangeEvent()))
      .subscribe(() => {
        // Route app to new phase.
        this.router.navigateByUrl(phaseToPreview);
      });
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
