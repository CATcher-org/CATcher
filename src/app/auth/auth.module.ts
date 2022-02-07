import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { AuthRoutingModule } from './auth-routing.module';
import { AuthComponent } from './auth.component';
import { ConfirmLoginComponent } from './confirm-login/confirm-login.component';
import { JsonParseErrorDialogComponent } from './profiles/json-parse-error-dialog/json-parse-error-dialog.component';
import { ProfilesComponent } from './profiles/profiles.component';
import { SessionSelectionComponent } from './session-selection/session-selection.component';

@NgModule({
  imports: [AuthRoutingModule, SharedModule, CommonModule],
  declarations: [AuthComponent, ProfilesComponent, JsonParseErrorDialogComponent, ConfirmLoginComponent, SessionSelectionComponent],
  entryComponents: [JsonParseErrorDialogComponent]
})
export class AuthModule {}
