import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatTabChangeEvent } from '@angular/material';
import { Issue } from '../../../../core/models/issue.model';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { LabelService } from '../../../../core/services/label.service';
import { IssueService } from '../../../../core/services/issue.service';
import { escapeHTML, replaceNewlinesWithBreakLines } from '../../../lib/html';

@Component({
  selector: 'app-conflict-dialog',
  templateUrl: 'conflict-dialog.component.html',
  styleUrls: ['./conflict-dialog.component.css']
})
export class ConflictDialogComponent {
  isOnPreview = false;
  isReady = false;
  updatedHtml: SafeHtml;

  constructor(
    public dialogRef: MatDialogRef<ConflictDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Issue,
    private sanitizer: DomSanitizer,
    public labelService: LabelService,
    public issueService: IssueService) {

    this.updatedHtml = sanitizer.bypassSecurityTrustHtml(replaceNewlinesWithBreakLines(escapeHTML(data.teamResponse)));
    this.isReady = true;
  }

  close(): void {
    this.dialogRef.close();
  }

  handleTabChange(event: MatTabChangeEvent): void {
    this.isOnPreview = (event.index === 1);
  }
}
