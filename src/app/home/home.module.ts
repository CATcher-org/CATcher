import { NgModule } from '@angular/core';

import { HomeComponent } from './home.component';
import {HomeRoutingModule} from './home-routing.module';
import {SharedModule} from '../shared/shared.module';
import { Phase2Component } from './phase2/phase2.component';
import { Phase3Component } from './phase3/phase3.component';

@NgModule({
  imports: [
    HomeRoutingModule,
    SharedModule
  ],
  declarations: [
    HomeComponent,
    Phase2Component,
    Phase3Component,
  ],
})
export class HomeModule {}
