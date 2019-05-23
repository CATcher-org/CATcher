import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import ProfilesJson from './profiles.json';
import {AppConfig} from '../../../environments/environment';
import {MatSnackBar} from '@angular/material';

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

  profiles: Profile[] = undefined;
  blankProfile: Profile = {profileName: '', password: '', username: '',
    encodedText: ''};

  private readonly fs = require('fs');
  public filePath: string = __dirname.split('CATcher', 1)[0].concat('profiles.json');

  @Output() selectedProfile: EventEmitter<Profile> = new EventEmitter<Profile>();

  constructor(private snackBar: MatSnackBar) { }

  ngOnInit() {


    if (this.isDeveloperMode()) {

      this.profiles = ProfilesJson.profiles;
      if (!this.profilesCorrectlyConfigured(this.profiles)) {
       this.openJsonErrorSnackBar();
       this.profiles = undefined;
      }

    } else {

      if (this.userProfileFileExists(this.filePath)) {
        try {
          this.profiles = JSON.parse(this.fs.readFileSync(this.filePath))['profiles'];
          if (!this.profilesCorrectlyConfigured(this.profiles)) {
            this.openJsonErrorSnackBar();
            this.profiles = undefined;
          }
        } catch (e) {
          console.log(e);
          this.openJsonErrorSnackBar();
        }
      }
    }


  }

  openJsonErrorSnackBar() {
    this.snackBar.open('The profiles.json file is not configured properly\n'.concat(
      'If you wish to use the preset profiles, please re-configure the profiles.json file and restart the application'
    ), null, {duration: 5000});
  }

  profilesCorrectlyConfigured(profiles: Profile[]): boolean {
    if (profiles === undefined) {
      return false;
    } else {
      return profiles.filter(
        profile => (profile.profileName === undefined
          || profile.encodedText === undefined)).length === 0;
    }
  }

  userProfileFileExists(filePath: string): boolean {
    console.log(filePath);
    return this.fs.existsSync(filePath);
  }

  selectProfile(profile: Profile) {
    this.selectedProfile.emit(profile);
  }

  isDeveloperMode(): boolean {
    return AppConfig.production === false;
  }

}
