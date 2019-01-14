import { Component, OnInit } from '@angular/core';
import {ElectronService} from '../../services/electron.service';
import {AuthService} from '../../services/auth/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  constructor(private electronService: ElectronService, private auth: AuthService) { }

  ngOnInit() {
  }

  logInWithGithub() {
    this.auth.startOAuthProcess();
  }
}
