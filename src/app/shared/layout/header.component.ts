import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { PhaseService } from '../../core/services/phase.service';
import { UserService } from '../../core/services/user.service';
import { Router, RoutesRecognized } from '@angular/router';
import { filter, pairwise } from 'rxjs/operators';
import { GithubEventService } from '../../core/services/githubevent.service';
import { ErrorHandlingService } from '../../core/services/error-handling.service';
import { IssueService } from '../../core/services/issue.service';

@Component({
  selector: 'app-layout-header',
  templateUrl: './header.component.html'
})
export class HeaderComponent implements OnInit {
  private prevUrl;
  isReloadBtnDisabled = false;

  constructor(private router: Router, public auth: AuthService, public phaseService: PhaseService, public userService: UserService,
              private location: Location, private githubEventService: GithubEventService, private issueService: IssueService,
              private errorHandlingService: ErrorHandlingService) {
    router.events.pipe(
      filter((e: any) => e instanceof RoutesRecognized),
      pairwise()
    ).subscribe(e => {
      this.prevUrl = e[0].urlAfterRedirects;
    });
  }

  ngOnInit() {}

  needToShowBackButton(): boolean {
    return `/${this.phaseService.currentPhase}` !== this.router.url && this.router.url !== '/';
  }

  needToShowReloadButton(): boolean {
    return this.router.url !== '/phase1/issues/new';
  }

  goBack() {
    if (this.prevUrl === `/${this.phaseService.currentPhase}/issues/new`) {
      this.router.navigate(['/phase1']);
    } else {
      this.location.back();
    }
  }

  reload() {
    this.isReloadBtnDisabled = true;

    this.githubEventService.reloadPage().subscribe(
      (success) => success,
      (error) => {
        this.errorHandlingService.handleHttpError(error, () => this.githubEventService.reloadPage());
      });

    // Prevent user from spamming the reload button
    setTimeout(() => {
      this.isReloadBtnDisabled = false;
    },
    3000);
  }

  logOut() {
    this.auth.logOut();
  }
}
