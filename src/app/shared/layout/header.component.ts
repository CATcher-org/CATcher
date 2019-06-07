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

    if (issueUrlIndex < 0) {
      const filterValue = '?q=is%3Aissue+is%3Aopen+'.concat(this.issueService.getIssueSearchFilter());
      issueUrl = '/issues'.concat(filterValue);
    } else {
      issueUrl = routerUrl.substring(issueUrlIndex); // issueUrl will be from '/' onwards
    }
    shell.openExternal('https://github.com/'.concat(repoUrl).concat(issueUrl));
  }

  logOut() {
    this.auth.logOut();
  }
}
