import {Component, OnInit} from '@angular/core';
import {MatDialogRef} from '@angular/material';
import {CanDeactivateIssueGuard} from '../can-deactivate-issue-guard.service';

/**
 *
 */

@Component({
  selector: 'app-user-confirmation',
  templateUrl: './user-confirmation.component.html',
  styleUrls: ['./user-confirmation.component.css']
})
export class UserConfirmationComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<CanDeactivateIssueGuard>) { }

  ngOnInit() {
  }

  onNoClick(): void {
    this.dialogRef.close(false);
  }

}
