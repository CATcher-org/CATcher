import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatTabChangeEvent } from '@angular/material';
import { Conflict } from '../../../core/models/conflict.model';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-conflict-dialog',
  templateUrl: 'conflict-dialog.component.html',
  styleUrls: ['./conflict-dialog.component.css']
})
export class ConflictDialogComponent {
  isOnPreview = false;
  showDiff = true;
  diffHtml: SafeHtml;
  updatedHtml: SafeHtml;
  isReady = false;

  constructor(
    public dialogRef: MatDialogRef<ConflictDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Conflict,
    private sanitizer: DomSanitizer) {

    this.diffHtml = sanitizer.bypassSecurityTrustHtml(data.getHtmlDiffString());
    this.updatedHtml = sanitizer.bypassSecurityTrustHtml(data.getHtmlUpdatedString());
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
}
