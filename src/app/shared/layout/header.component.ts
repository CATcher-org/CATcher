import { Component, OnInit } from '@angular/core';
import {AuthService} from '../../core/services/auth.service';
import {PhaseService} from '../../core/services/phase.service';

@Component({
  selector: 'app-layout-header',
  templateUrl: './header.component.html'
})
export class HeaderComponent implements OnInit {
  constructor(public auth: AuthService, private phaseService: PhaseService) {}

  ngOnInit() {}

  logOut() {
    this.auth.logOut();
  }
}
