// https://stackoverflow.com/a/49920846
import { Directive, Output, EventEmitter, HostListener } from '@angular/core';

@Directive({
  selector: '[ctrlKeys]',
})
export class CtrlKeysDirective  {
  @Output() ctrlV = new EventEmitter();
  @Output() ctrlC = new EventEmitter();

  @HostListener('keydown.control.v') onCtrlV() {
    this.ctrlV.emit();
  }

  @HostListener('keydown.control.c') onCtrlC() {
    this.ctrlC.emit();
  }
}
