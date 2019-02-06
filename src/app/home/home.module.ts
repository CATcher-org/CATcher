import { NgModule } from '@angular/core';

import { HomeComponent } from './home.component';
import {HomeRoutingModule} from './home-routing.module';
import {SharedModule} from '../shared/shared.module';
import { SecondPhaseComponent } from './second-phase/second-phase.component';

@NgModule({
  imports: [
    HomeRoutingModule,
    SharedModule
  ],
  declarations: [
    HomeComponent,
    SecondPhaseComponent
  ],
})
export class HomeModule {}
