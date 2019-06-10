import { Component, OnInit } from '@angular/core';
import {Location} from '@angular/common';
import {AuthService} from '../../core/services/auth.service';
import {PhaseService} from '../../core/services/phase.service';
import {UserService} from '../../core/services/user.service';
import {NavigationEnd, Router, RoutesRecognized} from '@angular/router';
import {filter, pairwise} from 'rxjs/operators';
import { shell } from 'electron';
import { GithubService } from '../../core/services/github.service';
import { IssueService } from '../../core/services/issue.service';

@Component({
  selector: 'app-layout-header',
  templateUrl: './header.component.html'
})
export class HeaderComponent implements OnInit {
  private prevUrl;
  FILTER_START = '?q=is%3Aissue+is%3Aopen+'; // the filtered list must be an issue and must be open
  TUTORIAL_LABEL = '+label%3Atutorial.';
  TEAM_LABEL = '+label%3Ateam.';
  EXCLUDE_DUPLICATE_LABEL = '+-label%3Aduplicate'; // exclude duplicate issues

  constructor(private router: Router, public auth: AuthService, public phaseService: PhaseService, public userService: UserService,
              private location: Location, private githubService: GithubService, private issueService: IssueService) {
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

  goBack() {
    if (this.prevUrl === `/${this.phaseService.currentPhase}/issues/new`) {
      this.router.navigate(['/phase1']);
    } else {
      this.location.back();
    }
  }

  viewBrowser() {
    const repoUrl = this.githubService.getRepoURL();
    const routerUrl = this.router.url.substring(1); // remove the first '/' from string
    const issueUrlIndex = routerUrl.indexOf('/'); // find the second '/' index
    let issueUrl: string;

    // If issueUrlIndex can't find the second '/', then router is at the /issues page
    if (issueUrlIndex < 0) {
      issueUrl = '/issues'.concat(this.getSearchFilterString()).concat(this.getTeamFilterString());
    } else {
      issueUrl = routerUrl.substring(issueUrlIndex); // issueUrl will be from '/' onwards
    }
    shell.openExternal('https://github.com/'.concat(repoUrl).concat(issueUrl));
  }

  private getSearchFilterString() {
    return this.FILTER_START.concat(this.issueService.getIssueSearchFilter());
  }

  private getTeamFilterString() {
    if (this.issueService.getIssueTeamFilter() === 'All Teams') {
      // Only exclude duplicates for phase 1 and 2
      return (this.phaseService.currentPhase === 'phase3') ? '' : this.EXCLUDE_DUPLICATE_LABEL;
    }
    const teamFilter = this.issueService.getIssueTeamFilter().split('-');
    const tutorial = teamFilter[0];
    const team = teamFilter[1];

    const teamLabel = this.TUTORIAL_LABEL.concat(tutorial).concat(this.TEAM_LABEL).concat(team);
    // Only exclude duplicates for phase 1 and 2
    return (this.phaseService.currentPhase === 'phase3') ? teamLabel : this.EXCLUDE_DUPLICATE_LABEL.concat(teamLabel);
  }

  logOut() {
    this.auth.logOut();
  }
}
