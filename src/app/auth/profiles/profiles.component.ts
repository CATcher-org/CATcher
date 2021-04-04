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
import { Profile, isValidProfile } from '../../core/models/profile.model';
import { ProfileService } from '../../core/services/profile.service';

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

  selectedProfile: Profile = this.blankProfile;
  @Output() selectedProfileEmitter: EventEmitter<Profile> = new EventEmitter<Profile>();

  profilesData = {
    isDirectoryMessageVisible: false,
    fileName: null,
    fileDirectory: null
  };

  constructor(
    public errorDialog: MatDialog,
    public profileService: ProfileService
  ) { }

  ngOnInit() {
    this.initProfiles();
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
          const { profiles } = JSON.parse(reader.result);
          if (!profiles.every(isValidProfile)) {
            throw new Error('profiles.json is malformed');
          }
          this.profiles = profiles.concat(this.profiles).filter((p) => !!p);
          target.value = '';
        } catch (e) {
          this.openErrorDialog();
        }
      }
    };
    reader.readAsText(file);
  }

  /**
   * Processes available Profiles information from the extenral repository.
   */
  initProfiles(): void {
    this.profileService.fetchExternalProfiles().then(externalProfiles => {
      this.profiles = this.profiles
      .concat(externalProfiles)
      .filter((p) => !!p);
    })
    .catch(e => this.openErrorDialog());
  }

  /**
   * Makes Error dialog visible to the user.
   */
  openErrorDialog(): void {
    this.errorDialog.open(JsonParseErrorDialogComponent);
  }

  /**
   * Sends the selected profile information to listening component.
   * @param profile - Profile selected by user.
   */
  selectProfile(profile: Profile): void {
    if (profile === this.blankProfile || isValidProfile(profile)) {
      this.selectedProfileEmitter.emit(profile);
    } else {
      this.openErrorDialog();
    }
  }
}
