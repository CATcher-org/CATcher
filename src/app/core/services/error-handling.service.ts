import { ErrorHandler, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material';
import { GeneralMessageErrorComponent } from '../../shared/error-toasters/general-message-error/general-message-error.component';
import { FormErrorComponent } from '../../shared/error-toasters/form-error/form-error.component';
import { HttpErrorResponse } from '@angular/common/http';
import { RequestError } from '@octokit/request-error';
import { LoggingService } from './logging.service';
import internal = require('events');
import { ComponentType } from '@angular/core/src/render3';

export const ERRORCODE_NOT_FOUND = 404;

const FILTERABLE = ['node_modules'];

@Injectable({
  providedIn: 'root',
})
export class ErrorHandlingService implements ErrorHandler {

  constructor(private snackBar: MatSnackBar, private logger: LoggingService) {}

  handleError(error: HttpErrorResponse | Error | RequestError, actionCallback?: () => void) {
    this.logger.error(error);
    if (error instanceof Error) {
      this.logger.error(this.cleanStack(error.stack));
    }
    if (error instanceof HttpErrorResponse || error instanceof RequestError) {
      this.handleHttpError(error, actionCallback);
    } else {
      this.handleGeneralError(error.message || JSON.stringify(error));
    }
  }

  private cleanStack(stacktrace: string): string {
    return stacktrace
            .split('\n')
            .filter(line => !FILTERABLE.some(word => line.includes(word))) // exclude lines that contain words in FILTERABLE
            .join('\n');
  }

  // Ref: https://developer.github.com/v3/#client-errors
  private handleHttpError(error: HttpErrorResponse | RequestError, actionCallback?: () => void): void {
    // Angular treats 304 Not Modified as an error, we will ignore it.
    if (error.status === 304) {
      return;
    }

    if (!navigator.onLine) {
      this.handleGeneralError('No Internet Connection');
      return;
    }

    switch (error.status) {
      case 500: // Internal Server Error.
        this.snackBar.openFromComponent(GeneralMessageErrorComponent, {
          data: error,
          duration: 3000
        });
        break;
      case 422: // Form errors
        this.snackBar.openFromComponent(FormErrorComponent, {
          data: error,
          duration: 3000
        });
        break;
      case 400: // Bad request
      case 401: // Unauthorized
      case 404: // Not found
        this.snackBar.openFromComponent(GeneralMessageErrorComponent, {
          data: error,
          duration: 3000
        });
        break;
      default:
        this.snackBar.openFromComponent(GeneralMessageErrorComponent, {
          data: error,
          duration: 3000
        });
        return;
    }
  }

  private handleGeneralError(error: string): void {
    this.snackBar.openFromComponent(GeneralMessageErrorComponent, {
      data: {message: error},
      duration: 3000
    });
  }
}
