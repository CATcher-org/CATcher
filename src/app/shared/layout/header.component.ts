import { Component, OnInit } from '@angular/core';
import {AuthService} from '../../core/services/auth.service';
import {PhaseService} from '../../core/services/phase.service';
import {UserService} from '../../core/services/user.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-layout-header',
  templateUrl: './header.component.html'
})
export class HeaderComponent implements OnInit {
  constructor(private router: Router, public auth: AuthService, public phaseService: PhaseService, public userService: UserService) {}

  ngOnInit() {
    console.log(this.router.url);
  }

  needToShowBackButton(): boolean {
    return `/${this.phaseService.currentPhase}` !== this.router.url && this.router.url !== '/';
  }

  logOut() {
    this.auth.logOut();
  }
}
