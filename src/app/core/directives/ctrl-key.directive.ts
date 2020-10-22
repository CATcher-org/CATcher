// https://stackoverflow.com/a/49920846
import { Directive, Output, EventEmitter, HostListener } from '@angular/core';

@Directive({
  selector: '[ctrlKeys]',
})
export class CtrlKeysDirective  {
  @Output() ctrlV = new EventEmitter();

  @HostListener('window:keydown', ['$event'])
  onKeyPress($event: KeyboardEvent) {
      if (($event.ctrlKey || $event.metaKey) && $event.code === 'KeyV') {
        this.ctrlV.emit();
      }
  }
}
