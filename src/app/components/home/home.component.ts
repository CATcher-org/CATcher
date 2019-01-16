import { Component, OnInit } from '@angular/core';
import {ElectronService} from '../../services/electron.service';
import {AuthService} from '../../services/auth/auth.service';

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
