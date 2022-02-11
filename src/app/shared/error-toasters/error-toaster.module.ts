import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MaterialModule } from '../material.module';
import { FormErrorComponent } from './form-error/form-error.component';
import { GeneralMessageErrorComponent } from './general-message-error/general-message-error.component';
import { InvalidCredentialsErrorComponent } from './invalid-credentials-error/invalid-credentials-error.component';
import { ToasterComponent } from './toaster/toaster.component';

@NgModule({
  imports: [CommonModule, MaterialModule],
  declarations: [GeneralMessageErrorComponent, FormErrorComponent, InvalidCredentialsErrorComponent, ToasterComponent],
  exports: [GeneralMessageErrorComponent, FormErrorComponent, InvalidCredentialsErrorComponent],
  entryComponents: [GeneralMessageErrorComponent, FormErrorComponent, InvalidCredentialsErrorComponent]
})
export class ErrorToasterModule {}
