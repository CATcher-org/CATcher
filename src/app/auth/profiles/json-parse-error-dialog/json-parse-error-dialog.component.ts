import { Component, Inject, OnInit, SecurityContext } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { ProfilesComponent } from '../profiles.component';
import { getErrorMessage, PROFILE_ERRORS } from './json-parse-error-dialog.utils';

/**
 * This Component is responsible for informing the user if there
 * are errors in the profiles.json file that is available to the app.
 */

@Component({
  selector: 'app-json-parse-error-dialog',
  templateUrl: './json-parse-error-dialog.component.html',
  styleUrls: ['./json-parse-error-dialog.component.css']
})
export class JsonParseErrorDialogComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<ProfilesComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PROFILE_ERRORS,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {}

  /**
   * Closes the Dialog
   */
  onClick(): void {
    this.dialogRef.close();
  }

  /**
   * Get appropriate Error message.
   */
  getProfileErrorMessage() {
    const errorMessage = getErrorMessage(this.data);
    return this.sanitizer.sanitize(SecurityContext.HTML, errorMessage);
  }
}
