import { Component, OnInit } from '@angular/core';
import {AuthService} from '../../core/services/auth.service';

@Component({
  selector: 'app-layout-header',
  templateUrl: './header.component.html'
})
export class HeaderComponent implements OnInit {
  constructor(public auth: AuthService) {}

  ngOnInit() {}

  logOut() {
    this.auth.logOut();
  }
}
