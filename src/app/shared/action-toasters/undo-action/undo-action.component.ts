import { Component, Inject } from '@angular/core';
import { MatSnackBarRef, MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';

@Component({
  selector: 'app-undo-action',
  templateUrl: './undo-action.component.html'
})
export class UndoActionComponent {
  constructor(public snackBarRef: MatSnackBarRef<UndoActionComponent>, @Inject(MAT_SNACK_BAR_DATA) public data: any) {}
}
