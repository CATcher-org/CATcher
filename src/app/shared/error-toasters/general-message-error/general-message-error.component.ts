import { Component, Inject } from '@angular/core';
import { MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';

@Component({
  selector: 'app-general-message-error',
  templateUrl: './general-message-error.component.html'
})
export class GeneralMessageErrorComponent {
  constructor(@Inject(MAT_SNACK_BAR_DATA) public data: any) {}
}
