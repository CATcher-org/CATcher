import { Component, OnInit } from '@angular/core';
import {Location} from '@angular/common';
import {AuthService} from '../../core/services/auth.service';
import {PhaseService} from '../../core/services/phase.service';
import {UserService} from '../../core/services/user.service';
import {NavigationEnd, Router, RoutesRecognized} from '@angular/router';
import {filter, pairwise} from 'rxjs/operators';
import { GithubEventService } from '../../core/services/githubevent.service';
import { ErrorHandlingService } from '../../core/services/error-handling.service';

@Component({
  selector: 'app-layout-header',
  templateUrl: './header.component.html'
})
export class HeaderComponent implements OnInit {
  private prevUrl;
  isSyncButtonDisabled = false;

  constructor(private router: Router, public auth: AuthService, public phaseService: PhaseService, public userService: UserService,
              private location: Location, private githubEventService: GithubEventService,
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

  refresh() {
    this.isSyncButtonDisabled = true;

    this.githubEventService.getLatestChangeEvent().subscribe((eventResponse) => {
        // Will only allow page to reload if the latest modify time is different
        // from last modified, meaning that some changes to the repo has occured.
        if (eventResponse['created_at'] !== this.githubEventService.getLastModifiedTime() ||
        eventResponse['issue']['updated_at'] !== this.githubEventService.getLastModifiedCommentTime()) {
          this.router.navigate([this.router.url]);
          this.githubEventService.setLastModifiedTime(eventResponse['created_at']);
          this.githubEventService.setLastModifiedCommentTime(eventResponse['issue']['updated_at']);
        }
      }, (error) => {
        this.errorHandlingService.handleHttpError(error, () => this.githubEventService.getLatestChangeEvent());
      });

    // Prevent user from spamming the reload button
    setTimeout(() => {
      this.isSyncButtonDisabled = false;
    },
    3000);
  }

  logOut() {
    this.auth.logOut();
  }
}
