import { NgModule } from '@angular/core';

import {SharedModule} from '../shared/shared.module';
import {Phase3Component} from './phase3.component';
import {Phase3RoutingModule} from './phase3-routing.module';

@NgModule({
  imports: [
    Phase3RoutingModule,
    SharedModule,
  ],
  declarations: [
    Phase3Component,
  ],
})
export class Phase3Module {}
