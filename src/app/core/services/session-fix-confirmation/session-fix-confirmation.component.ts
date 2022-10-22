import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface RepositoryData {
  user: string;
  repoName: string;
}

@Component({
  selector: 'app-session-fix-confirmation',
  templateUrl: './session-fix-confirmation.component.html',
  styleUrls: ['./session-fix-confirmation.component.css']
})
export class SessionFixConfirmationComponent implements OnInit {
  constructor(public dialogRef: MatDialogRef<SessionFixConfirmationComponent>, @Inject(MAT_DIALOG_DATA) public data: RepositoryData) {}

  ngOnInit() {}
}
