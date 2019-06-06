import { Component, OnInit } from '@angular/core';
import {Location} from '@angular/common';
import {AuthService} from '../../core/services/auth.service';
import {PhaseService} from '../../core/services/phase.service';
import {UserService} from '../../core/services/user.service';
import {NavigationEnd, Router, RoutesRecognized} from '@angular/router';
import {filter, pairwise} from 'rxjs/operators';
import { shell } from 'electron';
import { GithubService } from '../../core/services/github.service';

@Component({
  selector: 'app-layout-header',
  templateUrl: './header.component.html'
})
export class HeaderComponent implements OnInit {
  private prevUrl;

  constructor(private router: Router, public auth: AuthService, public phaseService: PhaseService, public userService: UserService,
              private location: Location, private githubService: GithubService) {
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
    let issueUrl = this.router.url.substring(7); // remove the '/phase' from string
    if (issueUrl === '') {
      issueUrl = '/issues';
    }
    shell.openExternal('https://github.com/'.concat(repoUrl).concat(issueUrl));
  }

  logOut() {
    this.auth.logOut();
  }
}
