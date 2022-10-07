import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ProfilesComponent } from '../profiles.component';

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
  constructor(public dialogRef: MatDialogRef<ProfilesComponent>) {}

  ngOnInit() {}

  /**
   * Closes the Dialog
   */
  onClick(): void {
    this.dialogRef.close();
  }
}
