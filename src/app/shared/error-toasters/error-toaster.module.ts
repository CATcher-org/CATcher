import { NgModule } from '@angular/core';
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
    GeneralMessageErrorComponent,
    FormErrorComponent,
    InvalidCredentialsErrorComponent,
  ],
  exports: [
    GeneralMessageErrorComponent,
    FormErrorComponent,
    InvalidCredentialsErrorComponent,
  ],
  entryComponents: [
    GeneralMessageErrorComponent,
    FormErrorComponent,
    InvalidCredentialsErrorComponent,
  ]
})
export class ErrorToasterModule {}
