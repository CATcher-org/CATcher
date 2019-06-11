import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import {MatDialog, MatSnackBar} from '@angular/material';
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

@Component({
  selector: 'app-profiles',
  templateUrl: './profiles.component.html',
  styleUrls: ['./profiles.component.css']
})
export class ProfilesComponent implements OnInit {

  profiles: Profile[] = undefined; // List of profiles taken from profiles.json
  blankProfile: Profile = {profileName: '', password: '', username: '', encodedText: ''}; // A blank profile to reset values

  private readonly fs = require('fs');


  private readonly APPLICATION_AND_SUBDIRECTORIES: RegExp = /[\/\\]+[^\/\\]+\.(exe|app|AppImage)/g;
  private readonly PROFILES_FILE_NAME = 'profiles.json';
  private filePath: string;

  @Output() selectedProfile: EventEmitter<Profile> = new EventEmitter<Profile>();
  @Output() profileLocationPrompter: EventEmitter<{}> = new EventEmitter<{}>();

  constructor(public errorDialog: MatDialog, private snack: MatSnackBar) { }

  ngOnInit() {
    const path = require('path');
    const temp = ipcRenderer.sendSync('synchronous-message', 'getDirectory');
    this.snack.open(temp);
    this.filePath = path.join(
        temp.replace(this.APPLICATION_AND_SUBDIRECTORIES, ''),
        this.PROFILES_FILE_NAME);

    if (true || !this.userProfileFileExists(this.filePath)) {
      this.profileLocationPrompter.emit({
        'fileName': this.PROFILES_FILE_NAME,
        'fileDirectory': this.filePath.split(this.PROFILES_FILE_NAME)[0]
      });
      return;
    }

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
   */
  isValid(profiles: Profile[]): boolean {
    if (profiles === undefined) {
      return false;
    }
    return profiles.filter(profile => (profile.profileName === undefined || profile.encodedText === undefined))
        .length === 0;
  }

  /**
   * Returns true if the file indicated by the filePath exists.
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
