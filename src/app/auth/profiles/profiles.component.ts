import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material';
import { JsonParseErrorDialogComponent } from './json-parse-error-dialog/json-parse-error-dialog.component';
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

  private readonly APPLICATION_AND_SUBDIRECTORIES: RegExp = /\/*[^\/]+\.(exe|app|AppImage)\/*.*/g;
  private readonly PROFILES_FILE_NAME = 'profiles.json';
  private filePath: string;

  @Output() selectedProfile: EventEmitter<Profile> = new EventEmitter<Profile>();

  constructor(public errorDialog: MatDialog) { }

  ngOnInit() {

    this.filePath = ipcRenderer.sendSync('synchronous-message', 'getDirectory')
        .replace(this.APPLICATION_AND_SUBDIRECTORIES, '')
        .concat('/')
        .concat(this.PROFILES_FILE_NAME);

    if (this.userProfileFileExists(this.filePath)) {

      try {
        this.profiles = JSON.parse(this.fs.readFileSync(this.filePath))['profiles'];
      } catch (e) {
        console.log(e);
      }

      setTimeout(() => {
        if (!this.isValid(this.profiles)) {
          this.openErrorDialog();
          this.profiles = undefined;
        }
      });
    } else {
      console.log(this.filePath + ' does not exist.');
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
      if (profiles.filter(profile => (profile.profileName === undefined || profile.encodedText === undefined)).length === 0) {
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
}
