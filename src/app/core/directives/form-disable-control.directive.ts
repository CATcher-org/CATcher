import { NgControl } from '@angular/forms';
import { Directive, Input } from '@angular/core';

@Directive({
  selector: '[disableControl]'
})
export class FormDisableControlDirective {

  @Input() set disableControl(condition: boolean) {
    condition ? this.ngControl.control.disable() : this.ngControl.control.enable();
  }

  constructor( private ngControl: NgControl ) {
  }

}
