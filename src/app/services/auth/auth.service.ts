import { Injectable } from '@angular/core';
import {uuid} from '../../lib/uuid';
import {ElectronService} from '../electron.service';
import {HttpClient} from '@angular/common/http';
import {first} from 'rxjs/operators';

const CLIENT_ID = 'Iv1.1c0eb539036890b0';
const BASE_URL = 'https://github.com';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  /** The state of AuthRequest to Github. **/
  private state: string;
  private accessToken: string;

  constructor(private electronService: ElectronService,
              private httpClient: HttpClient) { }

  startOAuthProcess() {
    this.state = uuid();
    const oauthURL = this.getOAuthAuthorizationURL(this.state);
    this.electronService.getCurrentWindow().loadURL(oauthURL);
    this.electronService.getCurrentUrl();
  }

  /**
   * Handles the callback that is triggered when #startOAuthProcess() loads the oauthURL. The callback can be configured in the
   * application's setting page in Github.
   *
   * This will retrieve the access token from another local server which acts as a intermediary to retrieve the tokens from Github.
   * Refer to https://github.com/prose/gatekeeper on steps to set up the local server.
   * See https://github.com/isaacs/github/issues/330
   *
   * @return an Observable which will either contain the value of access_token or error from Github.
  */
  async handleCallback(url: string) {
    const raw_code = /code=([^&]*)/.exec(url) || null;
    const code = (raw_code && raw_code.length > 1) ? raw_code[1] : null;
    const error = /\?error=(.+)$/.exec(url);
    const state = /\?state=(.+)$/.exec(url);

    if (!code) {
      alert('Error: Unable to identify code from Github callback url.');
    }
    if (state && state.length > 1 && state[1] === this.state) {
      alert('Error: Unexpected callback.');
    }
    if (error && error.length > 1) {
      alert(`Error when handling callback: ${error[1]}`);
    }
    const result = await this.httpClient.get(`http://localhost:9999/authenticate/${code}`)
      .pipe(first()).toPromise();
    this.accessToken = result['token'];
  }

  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  private getOAuthAuthorizationURL(state: string): string {
    return `${BASE_URL}/login/oauth/authorize?client_id=${CLIENT_ID}&state=${state}`;
  }
}
