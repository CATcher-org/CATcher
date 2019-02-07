import {Component, OnDestroy, OnInit} from '@angular/core';
import {AuthService, AuthState} from '../core/services/auth.service';
import {Subscription} from 'rxjs';
import {FormBuilder, FormGroup, NgForm, Validators} from '@angular/forms';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent implements OnInit, OnDestroy {
  authState: AuthState;
  authStateSubscription: Subscription;
  loginForm: FormGroup;

  constructor(private auth: AuthService, private formBuilder: FormBuilder) { }

  ngOnInit() {
    this.authStateSubscription = this.auth.currentAuthState.subscribe((state) => {
      this.authState = state;
    });
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      encodedText: ['', Validators.required],
    });
  }

  ngOnDestroy() {
    this.authStateSubscription.unsubscribe();
  }

  login(form: NgForm) {
    if (this.loginForm.invalid) {
      return;
    } else {
      this.auth.determineRoutingPage(this.loginForm.get('encodedText').value);
      this.auth.startAuthentication(this.loginForm.get('username').value,
        this.loginForm.get('password').value);
    }
    form.resetForm();
  }
}
