import { NgModule } from '@angular/core';

import {AuthComponent} from './auth.component';
import {AuthRoutingModule} from './auth-routing.module';
import {SharedModule} from '../shared/shared.module';
import { ProfilesComponent } from './profiles/profiles.component';


@NgModule({
  imports: [
    AuthRoutingModule,
    SharedModule
  ],
  declarations: [
    AuthComponent,
    ProfilesComponent
  ],
})
export class AuthModule {}
