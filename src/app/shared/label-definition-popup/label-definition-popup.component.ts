import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';

/**
 * The LabelDefinitionPopupComponent is responsible for rendering the UserDialog
 * to show the definition of the corresponding label.
 */

@Component({
  selector: 'app-label-definition-popup',
  templateUrl: './label-definition-popup.component.html',
  styleUrls: ['./label-definition-popup.component.css']
})
export class LabelDefinitionPopupComponent {
  labelName: string;
  labelDefinitionHtmlTemplate;
  // Injection of a reference to Dialog from the Service that it is to be
  // displayed in.
  constructor(
    public dialogRef: MatDialogRef<LabelDefinitionPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
    private _sanitizer: DomSanitizer
  ) {
    this.labelName = data.header;
    // since we only display HTML fetched from our own source, we can safely bypass the sanitization of HTML
    this.labelDefinitionHtmlTemplate = _sanitizer.bypassSecurityTrustHtml(data.body);
  }

  /**
   * Closes the dialog.
   */
  onNoClick(): void {
    this.dialogRef.close(false);
  }
}
