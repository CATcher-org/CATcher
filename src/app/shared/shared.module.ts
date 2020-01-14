import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { MaterialModule } from './material.module';
import { ErrorToasterModule } from './error-toasters/error-toaster.module';
import { FormDisableControlDirective } from '../core/directives/form-disable-control.directive';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule,
    MaterialModule,
    ErrorToasterModule,
  ],
  declarations: [FormDisableControlDirective],
  exports: [
    FormDisableControlDirective,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule,
    MaterialModule,
    ErrorToasterModule,
  ]
})
export class SharedModule {}
