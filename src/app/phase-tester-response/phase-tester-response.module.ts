import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PhaseTesterResponseRoutingModule } from './phase-tester-response-routing.module';
import { PhaseTesterResponseComponent } from './phase-tester-response.component';
import { IssueComponent } from './issue/issue.component';

@NgModule({
  exports: [PhaseTesterResponseComponent],
  declarations: [PhaseTesterResponseComponent, IssueComponent],
  imports: [
    CommonModule,
    PhaseTesterResponseRoutingModule
  ]
})
export class PhaseTesterResponseModule { }
