import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import ProfilesJson from './profiles.json';
import {MatSnackBar} from '@angular/material';

export interface UserProfile {
  profileName: string;
  username: string;
  password: string;
}

export interface PhaseProfile {
  phaseName: string;
  encodedText: string;
}

@Component({
  selector: 'app-profiles',
  templateUrl: './profiles.component.html',
  styleUrls: ['./profiles.component.css']
})
export class ProfilesComponent implements OnInit {

  private profiles: UserProfile[];
  private phases: PhaseProfile[];
  @Output() selectedProfile: EventEmitter<UserProfile> =
    new EventEmitter<UserProfile>();
  @Output() selectedPhase: EventEmitter<PhaseProfile> =
    new EventEmitter<PhaseProfile>();

  constructor() { }

  ngOnInit() {
    this.profiles = ProfilesJson.profiles;
    this.phases = ProfilesJson.phases;
  }

  selectProfile(profile: UserProfile) {
    this.selectedProfile.emit(profile);
  }

  selectPhase(phase: PhaseProfile) {
    this.selectedPhase.emit(phase);
  }

}
