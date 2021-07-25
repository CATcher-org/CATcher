import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

/**
 * The ModalPopupComponent is responsible for rendering the UserDialog
 * to show the definition of the corresponding label.
 */

@Component({
  selector: 'app-modal-popup',
  templateUrl: './modal-popup.component.html',
  styleUrls: ['./modal-popup.component.css']
})
export class ModalPopupComponent implements OnInit {

  // Injection of a reference to Dialog from the Service that it is to be
  // displayed in.
  constructor(public dialogRef: MatDialogRef<ModalPopupComponent>,
            @Inject(MAT_DIALOG_DATA) public data
    ) { }

  ngOnInit() {
  }

  /**
   * Closes the dialog.
   */
  onNoClick(): void {
    this.dialogRef.close(false);
  }

}