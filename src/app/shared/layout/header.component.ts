import { Component, OnInit } from '@angular/core';
import {AuthService} from '../../core/services/auth.service';

@Component({
  selector: 'app-layout-header',
  templateUrl: './header.component.html'
})
export class HeaderComponent implements OnInit {
  constructor(private auth: AuthService) {}

  ngOnInit() {}

  logOut() {
    this.auth.logOut();
  }
}
