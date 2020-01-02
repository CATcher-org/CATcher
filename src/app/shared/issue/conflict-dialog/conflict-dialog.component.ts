import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatTabChangeEvent } from '@angular/material';
import { Conflict } from '../../../core/models/conflict.model';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { LabelService } from '../../../core/services/label.service';
import { IssueService } from '../../../core/services/issue.service';
import { Issue } from '../../../core/models/issue.model';

export interface ConflictDialogData {
  conflict: Conflict;
  updatedIssue?: Issue;
  title?: string;
}

@Component({
  selector: 'app-conflict-dialog',
  templateUrl: 'conflict-dialog.component.html',
  styleUrls: ['./conflict-dialog.component.css']
})
export class ConflictDialogComponent {
  isOnPreview = false;
  isReady = false;
  showDiff = true;

  diffHtml: SafeHtml;
  updatedHtml: SafeHtml;

  constructor(
    public dialogRef: MatDialogRef<ConflictDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConflictDialogData,
    private sanitizer: DomSanitizer,
    public labelService: LabelService,
    public issueService: IssueService) {

    this.diffHtml = sanitizer.bypassSecurityTrustHtml(data.conflict.getHtmlDiffString());
    this.updatedHtml = sanitizer.bypassSecurityTrustHtml(data.conflict.getHtmlUpdatedString());
    this.isReady = true;
  }

  close(): void {
    this.dialogRef.close();
  }

  handleChangeShowDiff() {
    this.showDiff = !this.showDiff;
  }

  handleTabChange(event: MatTabChangeEvent): void {
    this.isOnPreview = (event.index === 1);
  }

  /**
   * Will determine the appropriate condition to show the updated issue's attributes in the dialog.
   */
  toShowUpdatedIssue(): boolean {
    return !!this.data.updatedIssue;
  }
}
