import {Injectable} from '@angular/core';
import {MatSnackBar} from '@angular/material';
import {NoInternetConnectionComponent} from '../../shared/error-toasters/no-internet-connection/no-internet-connection.component';
import {GeneralMessageErrorComponent} from '../../shared/error-toasters/general-message-error/general-message-error.component';
import {FormErrorComponent} from '../../shared/error-toasters/form-error/form-error.component';
import {InvalidCredentialsErrorComponent} from "../../shared/error-toasters/invalid-credentials-error/invalid-credentials-error.component";

@Injectable({
  providedIn: 'root',
})
export class ErrorHandlingService {

  constructor(private snackBar: MatSnackBar) {}

  // Ref: https://developer.github.com/v3/#client-errors
  handleHttpError(error) {
    switch (error.status) {
      case 500:
        if (navigator.onLine) {
          this.snackBar.openFromComponent(GeneralMessageErrorComponent, {data: error});
        } else {
          this.snackBar.openFromComponent(NoInternetConnectionComponent, {data: error.request.method});
        }
        break;
      case 422:
        const formErrors = error.errors;
        this.snackBar.openFromComponent(FormErrorComponent, {data: formErrors});
        break;
      case 400:
        this.snackBar.openFromComponent(GeneralMessageErrorComponent, {data: error});
        break;
      case 401:
        this.snackBar.openFromComponent(InvalidCredentialsErrorComponent);
        break;
      default:
        return;
    }
  }
}
