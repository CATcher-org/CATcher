import { Directive, HostListener } from '@angular/core';
import { ErrorHandlingService } from '../services/error-handling.service';

class InvalidLinkError extends Error {
  constructor() {
    super('Invalid link!');
    Object.setPrototypeOf(this, InvalidLinkError.prototype);
  }
}

@Directive({
  selector: '[disableInternalLink]'
})
export class InternalLinkDisableDirective {
  constructor(private errorHandlingService: ErrorHandlingService) {}

  @HostListener('click', ['$event'])
  public onClick(e: MouseEvent): void {
    const srcElement = e.target;

    if (srcElement instanceof HTMLAnchorElement) {
      const baseURI = srcElement.baseURI;
      const href = srcElement.href;

      if (href.startsWith(baseURI)) {
        this.errorHandlingService.handleError(new InvalidLinkError());
        e.preventDefault();
        e.stopPropagation();
      }
    }
  }
}
