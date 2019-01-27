import { NgModule } from '@angular/core';
import {NoInternetConnectionComponent} from './no-internet-connection/no-internet-connection.component';
import {CommonModule} from '@angular/common';
import {MaterialModule} from '../material.module';
import {GeneralMessageErrorComponent} from './general-message-error/general-message-error.component';
import {FormErrorComponent} from './form-error/form-error.component';
import {InvalidCredentialsErrorComponent} from './invalid-credentials-error/invalid-credentials-error.component';

@NgModule({
  imports: [
    CommonModule,
    MaterialModule,
  ],
  declarations: [
    NoInternetConnectionComponent,
    GeneralMessageErrorComponent,
    FormErrorComponent,
    InvalidCredentialsErrorComponent,
  ],
  exports: [
    NoInternetConnectionComponent,
    GeneralMessageErrorComponent,
    FormErrorComponent,
    InvalidCredentialsErrorComponent,
  ],
  entryComponents: [
    NoInternetConnectionComponent,
    GeneralMessageErrorComponent,
    FormErrorComponent,
    InvalidCredentialsErrorComponent,
  ]
})
export class ErrorToasterModule {}
