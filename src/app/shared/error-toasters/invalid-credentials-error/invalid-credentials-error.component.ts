import { Component, Inject } from '@angular/core';
import { MatSnackBarRef, MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';

@Component({
  selector: 'app-form-error',
  templateUrl: './invalid-credentials-error.component.html'
})
export class InvalidCredentialsErrorComponent {
  constructor(public snackBarRef: MatSnackBarRef<InvalidCredentialsErrorComponent>, @Inject(MAT_SNACK_BAR_DATA) public data: any) {}
}
