import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LabelDropdownComponent } from './label-dropdown.component';
import { SharedModule } from '../shared.module';

@NgModule({
  declarations: [
    LabelDropdownComponent
  ],
  imports: [
    CommonModule,
    SharedModule
  ],
  exports: [
    LabelDropdownComponent
  ]
})
export class LabelDropdownModule { }
