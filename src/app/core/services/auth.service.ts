import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders} from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { NgZone } from '@angular/core';
import { ElectronService } from './electron.service';
import {ErrorHandlingService} from './error-handling.service';
import {GithubService} from './github.service';

export enum AuthState { 'NotAuthenticated', 'AwaitingAuthentication', 'Authenticated' }
enum StudentRoutes { '', '/student-second-phase'}
enum TutorRoutes {'/tutor', '/tutor-second-phase'}

const STUDENT: string = 'student'
const TUTOR: string = 'tutor'

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private accessToken: string;
  private userRole: string;
  private phaseNumber: string;
  private routingPageUrl: string;

  authStateSource = new BehaviorSubject(AuthState.NotAuthenticated);
  currentAuthState = this.authStateSource.asObservable();

  constructor(private electronService: ElectronService, private router: Router, private ngZone: NgZone,
              private http: HttpClient,  private errorHandlingService: ErrorHandlingService,
              private githubService: GithubService) {
  }

  startAuthentication(username: String, password: String) {
    this.changeAuthState(AuthState.AwaitingAuthentication);
    const header = new HttpHeaders().set('Authorization', 'Basic ' + btoa(username + ':' + password));
    this.http.get('https://api.github.com/user', { headers: header })
      .subscribe(
        response => {
          this.changeAuthState(AuthState.Authenticated);
          this.githubService.storeCredentials(username, password);
          this.ngZone.run(() => this.router.navigate([this.routingPageUrl]));
        },
        error => {
          this.errorHandlingService.handleHttpError(error.error);
        }
      );
  }

  determineRoutingPage(encodedText: String) {
    this.parseEncodedText(encodedText);
    console.log(this.phaseNumber);
    switch (this.userRole.toLowerCase()) {
      case STUDENT:
        if (this.phaseNumber.toLowerCase() === 'phase1') {
          this.routingPageUrl = StudentRoutes[0];
        } else {
          this.routingPageUrl = StudentRoutes[1];
        }
        break;
      case TUTOR:
        if (this.phaseNumber.toLowerCase() === 'phase1') {
          this.routingPageUrl = TutorRoutes[0];
        } else {
          this.routingPageUrl = TutorRoutes[1];
        }
        break;
      default:
        this.routingPageUrl = '';
        return;
    }
  }

  parseEncodedText(encodedText: String): void {
      let splitted = encodedText.split("@");
      this.userRole = splitted[0];
      this.phaseNumber = splitted[1];
  }

  logOut(): void {
    this.accessToken = null;
    this.changeAuthState(AuthState.NotAuthenticated);
    this.ngZone.run(() => this.router.navigate(['/login']));
  }

  isAuthenticated(): boolean {
    return !!(this.authStateSource.getValue() === 2);
  }

  private changeAuthState(newAuthState: AuthState) {
    this.authStateSource.next(newAuthState);
  }
}
