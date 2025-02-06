import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { PhaseBugTrimmingRoutingModule } from './phase-bug-trimming-routing.module';
import { PhaseBugTrimmingComponent } from './phase-bug-trimming.component';

@NgModule({
  imports: [PhaseBugTrimmingRoutingModule, SharedModule],
  declarations: [PhaseBugTrimmingComponent]
})
export class PhaseBugTrimmingModule {}
