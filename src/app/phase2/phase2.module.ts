import { NgModule } from '@angular/core';

import {SharedModule} from '../shared/shared.module';
import {Phase2Component} from './phase2.component';
import {Phase2RoutingModule} from './phase2-routing.module';

@NgModule({
  imports: [
    Phase2RoutingModule,
    SharedModule,
  ],
  declarations: [
    Phase2Component,
  ],
})
export class Phase2Module {}
