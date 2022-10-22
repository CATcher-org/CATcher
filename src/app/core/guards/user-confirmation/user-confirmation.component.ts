import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CanDeactivateIssueGuard } from '../can-deactivate-issue-guard.service';

/**
 * The UserConfirmationComponent is responsible for rendering the UserDialog
 * to verify if certain changes made to relevant inputs are to be discarded.
 */

@Component({
  selector: 'app-user-confirmation',
  templateUrl: './user-confirmation.component.html',
  styleUrls: ['./user-confirmation.component.css']
})
export class UserConfirmationComponent implements OnInit {
  // Injection of a reference to Dialog from the Service that it is to be
  // displayed in.
  constructor(public dialogRef: MatDialogRef<CanDeactivateIssueGuard>, @Inject(MAT_DIALOG_DATA) public data) {}

  ngOnInit() {}

  /**
   * Closes the dialog.
   */
  onNoClick(): void {
    this.dialogRef.close(false);
  }
}
