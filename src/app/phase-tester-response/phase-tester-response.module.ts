import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PhaseTesterResponseRoutingModule } from './phase-tester-response-routing.module';
import { PhaseTesterResponseComponent } from './phase-tester-response.component';

@NgModule({
  exports: [PhaseTesterResponseComponent],
  declarations: [PhaseTesterResponseComponent],
  imports: [
    CommonModule,
    PhaseTesterResponseRoutingModule
  ]
})
export class PhaseTesterResponseModule { }
