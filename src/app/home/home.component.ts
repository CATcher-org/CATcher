import { Component, OnInit } from '@angular/core';
import {AuthService} from '../core/services/auth.service';
import {ElectronService} from '../core/services/electron.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  constructor(private electronService: ElectronService, private auth: AuthService) { }

  ngOnInit() { }

  logOut() {
    this.auth.logOut();
  }

}
