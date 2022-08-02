import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Phase } from '../core/models/phase.model';
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
  constructor(
    private phaseService: PhaseService,
    private githubService: GithubService,
    private githubEventService: GithubEventService,
    private issueService: IssueService,
    private errorHandlingService: ErrorHandlingService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  previewInput = new FormGroup({
    phase: new FormControl(''),
    username: new FormControl('')
  });

  ngOnInit(): void {}

  handleSubmit(): void {
    const phaseToPreview = this.previewInput.get('phase').value;
    const username = this.previewInput.get('username').value;

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

  private reload() {
    this.githubEventService.reloadPage().subscribe(
      (success) => success,
      (error) => {
        this.errorHandlingService.handleError(error, () => this.githubEventService.reloadPage());
      }
    );
  }
}
