import { Component, OnInit } from '@angular/core';
import {Location} from '@angular/common';
import {AuthService} from '../../core/services/auth.service';
import {PhaseService} from '../../core/services/phase.service';
import {UserService} from '../../core/services/user.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-layout-header',
  templateUrl: './header.component.html'
})
export class HeaderComponent implements OnInit {
  constructor(private router: Router, public auth: AuthService, public phaseService: PhaseService, public userService: UserService,
              private location: Location) {}

  ngOnInit() {}

  needToShowBackButton(): boolean {
    return `/${this.phaseService.currentPhase}` !== this.router.url && this.router.url !== '/';
  }

  goBack() {
    this.location.back();
  }

  logOut() {
    this.auth.logOut();
  }
}
