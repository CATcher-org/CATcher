import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material';
import { JsonParseErrorDialogComponent } from './json-parse-error-dialog/json-parse-error-dialog.component';
import {
  trigger,
  state,
  style,
  animate,
  transition
} from '@angular/animations';
import { ElectronService } from '../../core/services/electron.service';
import { AppConfig } from '../../../environments/environment';

/**
 * Indicates all the elements that make up a Profile.
 */
export interface Profile {
  profileName: string;
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

  profiles: Profile[] = []; // List of profiles taken from profiles.json
  blankProfile: Profile = {profileName: '', encodedText: ''}; // A blank profile to reset values
  animationActivated = false; // Assists color change animations.

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

  constructor(private electronService: ElectronService, public errorDialog: MatDialog) { }

  ngOnInit() {
    const temp = this.electronService.getCurrentDirectory();
    this.filePath = [temp.replace(this.APPLICATION_AND_SUBDIRECTORIES, ''), this.PROFILES_FILE_NAME].join('/');
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
   */
  fileSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    const file = target.files[0];
    const reader = new FileReader();

    reader.onload = () => {
      if (!(reader.result instanceof ArrayBuffer)) {
        try {
          this.profiles = JSON.parse(reader.result).profiles
            .concat(AppConfig.profiles)
            .filter(p => !!p);
          target.value = '';
        } catch (e) {
          this.openErrorDialog();
        }
      }
    };
    reader.readAsText(file);
  }

  /**
   * Processes available Profiles information from application's directory.
   * The automatic detection of profiles in the current directory will only be available in Electron version.
   */
  readProfiles(): void {
    const isFileExists: boolean = this.userProfileFileExists(this.filePath);
    // Informing Parent Component (Auth) of file selection
    this.profilesData.fileName = this.PROFILES_FILE_NAME;
    this.profilesData.fileDirectory = this.filePath.split(this.PROFILES_FILE_NAME)[0];
    this.profilesData.isDirectoryMessageVisible = !isFileExists;
    this.profileDataEmitter.emit(this.profilesData);

    if (this.electronService.isElectron() && isFileExists) {
      try {
        this.profiles = [];
        this.profiles = JSON.parse(this.electronService.readFile(this.filePath))['profiles'];
      } catch (e) {
        this.openErrorDialog();
      }

      // Validity Check if custom profile.json file has values in it.
      try {
        this.assertProfilesValidity(this.profiles);
      } catch (e) {
        setTimeout(() => {
          this.profiles = AppConfig.profiles || [];
          this.openErrorDialog();
        });
      }
    }

    this.profiles = this.profiles
      .concat(AppConfig.profiles)
      .filter(p => !!p);
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
    return this.electronService.fileExists(filePath);
  }

  /**
   * Sends the selected profile information to listening component.
   * @param profile - Profile selected by user.
   */
  selectProfile(profile: Profile): void {
    this.selectedProfileEmitter.emit(profile);
  }
}
