import {Component, Inject, OnInit} from '@angular/core';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material';

@Component({
  selector: 'app-form-error',
  templateUrl: './invalid-credentials-error.component.html',
})
export class InvalidCredentialsErrorComponent implements OnInit {
  constructor(
    public snackBarRef: MatSnackBarRef<InvalidCredentialsErrorComponent>,
    @Inject(MAT_SNACK_BAR_DATA) public data: any) {}

  ngOnInit() {
    this.snackBarRef.containerInstance.snackBarConfig.duration = 5000;
  }
}
