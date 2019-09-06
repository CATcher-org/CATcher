import {Injectable} from '@angular/core';
import {MatSnackBar} from '@angular/material';
import {NoInternetConnectionComponent} from '../../shared/error-toasters/no-internet-connection/no-internet-connection.component';
import {GeneralMessageErrorComponent} from '../../shared/error-toasters/general-message-error/general-message-error.component';
import {FormErrorComponent} from '../../shared/error-toasters/form-error/form-error.component';

export const ERRORCODE_NOT_FOUND = 404;

@Injectable({
  providedIn: 'root',
})
export class ErrorHandlingService {

  constructor(private snackBar: MatSnackBar) {}

  // Ref: https://developer.github.com/v3/#client-errors
  handleHttpError(error, actionCallback?: () => void) {
    console.log(error);
    switch (error.status) {
      case 500: // Internal Server Error. Could also be due to user not having internet connection.
        if (navigator.onLine) {
          this.snackBar.openFromComponent(GeneralMessageErrorComponent, {data: error});
        } else {
          const snackbarRef = this.snackBar.openFromComponent(NoInternetConnectionComponent, {data: error.request.method});
          snackbarRef.onAction().subscribe(actionCallback);
        }
        break;
      case 422: // Form errors
        this.snackBar.openFromComponent(FormErrorComponent, {data: error});
        break;
      case 400: // Bad request
      case 401: // Unauthorized
      case 404: // Not found
        this.snackBar.openFromComponent(GeneralMessageErrorComponent, {data: error});
        break;
      default:
        this.snackBar.openFromComponent(GeneralMessageErrorComponent, {data: error});
        return;
    }
  }

  handleGeneralError(error: string) {
    console.log(error);
    this.snackBar.openFromComponent(GeneralMessageErrorComponent, {data: {message: error}});
  }
}
