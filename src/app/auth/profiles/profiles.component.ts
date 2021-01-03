import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material';
import { JsonParseErrorDialogComponent } from './json-parse-error-dialog/json-parse-error-dialog.component';
const { ipcRenderer } = require('electron');
import {
  trigger,
  state,
  style,
  animate,
  transition
} from '@angular/animations';

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
  styleUrls: ['./profiles.component.css'],
  animations: [
    // animation triggers go here
    trigger('triggerFileInput', [
      state('normal', style({})),
      state('pressed', style({
        color: 'orange'
      })),
      transition('normal => pressed', [
        animate('0.25s ease')
      ]),
      transition('pressed => normal', [
        animate('0.25s ease')
      ])
    ])
  ]
})
export class ProfilesComponent implements OnInit {

  private readonly ANIMATION_DURATION: number = 250;

  profiles: Profile[] = undefined; // List of profiles taken from profiles.json
  blankProfile: Profile = {profileName: '', password: '', username: '', encodedText: ''}; // A blank profile to reset values
  animationActivated = false; // Assists color change animations.

  // To be set to undefined array if not used.
  readonly defaultProfiles: Profile[] = [
    <Profile>{
      profileName: 'CS2103/T Alpha Test',
      encodedText: 'nus-cs2103-AY2021S1/alpha'
    },
    <Profile>{
      profileName: 'CS2103/T PE Dry run',
      encodedText: 'nus-cs2103-AY2021S1/PED'
    },
    <Profile>{
      profileName: 'CS2103/T PE',
      encodedText: 'nus-cs2103-AY2021S1/PE'
    },
    <Profile>{
      profileName: 'CS2113/T Alpha Test',
      encodedText: 'nus-cs2113-AY2021S1/alpha'
    },
    <Profile>{
      profileName: 'CS2113/T PE Dry run',
      encodedText: 'nus-cs2113-AY2021S1/PED'
    },
    <Profile>{
      profileName: 'CS2113/T PE',
      encodedText: 'nus-cs2113-AY2021S1/PE'
    }
  ];

  private readonly fs = require('fs');

  private readonly APPLICATION_AND_SUBDIRECTORIES: RegExp = /[\/\\]+[^\/\\]+\.(exe|app|AppImage|asar).*/g;
  private readonly PROFILES_FILE_NAME = 'profiles.json';
  private filePath: string;

  selectedProfile: Profile = this.blankProfile;
  @Output() selectedProfileEmitter: EventEmitter<Profile> = new EventEmitter<Profile>();
  @Output() profileDataEmitter: EventEmitter<{}> = new EventEmitter<{}>();

  profilesData = {
    isDirectoryMessageVisible: false,
    fileName: null,
    fileDirectory: null
  };

  constructor(public errorDialog: MatDialog) { }

  ngOnInit() {
    const path = require('path');
    const temp = ipcRenderer.sendSync('synchronous-message', 'getDirectory');
    this.filePath = path.join(
        temp.replace(this.APPLICATION_AND_SUBDIRECTORIES, ''),
        this.PROFILES_FILE_NAME);
    this.readProfiles();
  }

  /**
   * Activates the button selection animation and opens the file selector.
   * @param fileInput - OS default file selector.
   */
  fileSelectorInitiation(fileInput: HTMLInputElement): void {
    this.animationActivated = true;
    setTimeout(() => {
      this.animationActivated = false;
      fileInput.click();
    }, this.ANIMATION_DURATION);
  }

  /**
   * Reads the user selected file
   * @param fileInput - OS default file selector.
   */
  fileSelected(fileInput: HTMLInputElement): void {
    this.filePath = (fileInput.files[0].path);
    fileInput.value = '';
    this.readProfiles();
  }

  /**
   * Processes all available Profiles information.
   */
  readProfiles(): void {
    const isFileExists: boolean = this.userProfileFileExists(this.filePath);
    // Informing Parent Component (Auth) of file selection
    this.profilesData.fileName = this.PROFILES_FILE_NAME;
    this.profilesData.fileDirectory = this.filePath.split(this.PROFILES_FILE_NAME)[0];
    this.profilesData.isDirectoryMessageVisible = !isFileExists;
    this.profileDataEmitter.emit(this.profilesData);

    if (isFileExists) {
      try {
        this.profiles = JSON.parse(this.fs.readFileSync(this.filePath))['profiles'];
      } catch (e) {
        // Do nothing if there is a parsing error because this.profiles will be set to undefined on error.
      }

      // Validity Check if custom profile.json file has values in it.
      if (this.profiles !== undefined) {
        try {
          this.assertProfilesValidity(this.profiles);
        } catch (e) {
          setTimeout(() => {
            this.profiles = undefined;
            this.openErrorDialog();
          });
        }
      }
    }

    // Several Layers of True False Statements to decide which values to assign to this.profiles.
    this.profiles = this.profiles === undefined
      ? this.defaultProfiles === undefined ? undefined : this.defaultProfiles
      : this.defaultProfiles === undefined ? this.profiles : this.profiles.concat(this.defaultProfiles);
  }

  /**
   * Makes Error dialog visible to the user.
   */
  openErrorDialog(): void {
    this.errorDialog.open(JsonParseErrorDialogComponent);
  }

  /**
   * Verifies that every profile is correctly defined in the array of profiles.
   * @param profiles - Array of profiles sourced from profiles.json
   */
  assertProfilesValidity(profiles: Profile[]): void {
    if (profiles.filter(profile => (profile.profileName === undefined || profile.encodedText === undefined)).length !== 0) {
      throw new Error();
    }
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
    this.selectedProfileEmitter.emit(profile);
  }
}
