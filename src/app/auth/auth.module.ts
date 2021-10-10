import { NgModule } from '@angular/core';
import { AuthComponent } from './auth.component';
import { AuthRoutingModule } from './auth-routing.module';
import { SharedModule } from '../shared/shared.module';
import { ProfilesComponent } from './profiles/profiles.component';
import { JsonParseErrorDialogComponent } from './profiles/json-parse-error-dialog/json-parse-error-dialog.component';
import { CommonModule } from '@angular/common';
import { ConfirmLoginComponent } from './confirm-login/confirm-login.component';


@NgModule({
  imports: [
    AuthRoutingModule,
    SharedModule,
    CommonModule
  ],
  declarations: [
    AuthComponent,
    ProfilesComponent,
    JsonParseErrorDialogComponent,
    ConfirmLoginComponent
  ],
  entryComponents: [
    JsonParseErrorDialogComponent
  ],
})
export class AuthModule {}
