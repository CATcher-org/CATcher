import {Component, Inject, OnInit} from '@angular/core';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material';

@Component({
  selector: 'app-no-internet-connection',
  templateUrl: './no-internet-connection.component.html',
})
export class NoInternetConnectionComponent implements OnInit {
  constructor(
    public snackBarRef: MatSnackBarRef<NoInternetConnectionComponent>,
    @Inject(MAT_SNACK_BAR_DATA) public data: any) {}

  ngOnInit() {
    this.snackBarRef.onAction().subscribe(() => {
      window.location.reload();
    });
  }
}
