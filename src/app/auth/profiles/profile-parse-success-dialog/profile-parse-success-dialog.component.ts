import { Component, Input, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Profile } from '../../../core/models/profile.model';
import { ProfilesComponent } from '../profiles.component';

/**
 * This Component is responsible for informing the user if the profile
 * that was selected was successfully loaded.
 */

@Component({
  selector: 'app-profile-parse-success-dialog',
  templateUrl: './profile-parse-success-dialog.component.html',
  styleUrls: ['./profile-parse-success-dialog.component.css']
})
export class ProfileParseSuccessDialog implements OnInit {
  @Input() loadedProfile: Profile;

  constructor(public dialogRef: MatDialogRef<ProfilesComponent>) {}

  ngOnInit() {}

  /**
   * Closes the Dialog
   */
  onClick(): void {
    this.dialogRef.close();
  }
}
