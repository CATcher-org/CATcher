import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { AppConfig } from '../../../environments/environment';
import { MatDialog } from '@angular/material';
import {
  JsonParseErrorDialogComponent
} from './json-parse-error-dialog/json-parse-error-dialog.component';
import ProfilesJson from './profiles.json';
const { ipcRenderer } = require('electron');

/**
 * Indicates all the elements that make up a Profile.
 */
export interface Profile {
  profileName: string;
  username: string;
  password: string;
  encodedText: string;
}

/**
 * This component is responsible allowing the user to select a Profile
 * in the authentication page.
 */

@Component({
  selector: 'app-profiles',
  templateUrl: './profiles.component.html',
  styleUrls: ['./profiles.component.css']
})
export class ProfilesComponent implements OnInit {

  profiles: Profile[] = undefined; // List of profiles taken from profiles.json
  blankProfile: Profile = {profileName: '', password: '', username: '', encodedText: ''}; // A blank profile to reset values

  private readonly fs = require('fs');

  // path of profile.json (same folder as app for production)
  private filePath: string = __dirname.split('CATcher', 1)[0].concat('profiles.json');

  @Output() selectedProfile: EventEmitter<Profile> = new EventEmitter<Profile>();

  constructor(public errorDialog: MatDialog) { }

  ngOnInit() {
    // Matches with ApplicationName.exe / .app
    const directoryExtractor: RegExp = /[^\/]+\.(exe|app)\/.+/g;
    console.log(ipcRenderer.sendSync('synchronous-message', 'ping').replace(directoryExtractor, ''));

    // Developer Mode indicates that the profiles.json is internal.
    if (this.isDeveloperMode()) {

      this.profiles = ProfilesJson.profiles;

      setTimeout(() => {
        if (!this.isValid(this.profiles)) {
          this.openErrorDialog();
          this.profiles = undefined;
        }
      });

    // In Production mode the profiles.json is sourced from same folder as app.
    } else {

      if (this.userProfileFileExists(this.filePath)) {

        try {
          this.profiles = JSON.parse(
            this.fs.readFileSync(this.filePath))['profiles'];
        } catch (e) {
          console.log(e);
        }

        setTimeout(() => {
          if (!this.isValid(this.profiles)) {
            this.openErrorDialog();
            this.profiles = undefined;
          }
        });
      }
      // If profiles.json is not in the same folder as the app, do nothing.
    }
  }

  /**
   * Makes Error dialog visible to the user.
   */
  openErrorDialog(): void {
    this.errorDialog.open(JsonParseErrorDialogComponent);
  }

  /**
   * Checks that every profile is correctly defined in the array of profiles.
   * @param profiles - Array of profiles sourced from profiles.json
   * @return true if all profiles are correctly defined, false if otherwise.
   */
  isValid(profiles: Profile[]): boolean {
    if (profiles === undefined) {
      return false;
    } else {
      if (profiles.filter(
        profile => (profile.profileName === undefined
          || profile.encodedText === undefined)).length === 0) {
        return true;
      }
    }
  }

  /**
   * Takes the path of a file and checks that it exists in the system.
   * @param filePath - Path of file to check.
   */
  userProfileFileExists(filePath: string): boolean {
    return this.fs.existsSync(filePath);
  }

  /**
   * Sends the selected profile information to listening component.
   * @param profile - Profile selected by user.
   */
  selectProfile(profile: Profile): void {
    this.selectedProfile.emit(profile);
  }

  /**
   * Checks that the applicaton is in Developer Mode.
   * @return - true if Dev Mode, false if otherwise.
   */
  isDeveloperMode(): boolean {
    return AppConfig.production === false;
  }

}
