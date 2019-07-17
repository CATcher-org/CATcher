import { NgModule } from '@angular/core';
import { AuthComponent } from './auth.component';
import { AuthRoutingModule } from './auth-routing.module';
import { SharedModule } from '../shared/shared.module';
import { ProfilesComponent } from './profiles/profiles.component';
import { JsonParseErrorDialogComponent } from './profiles/json-parse-error-dialog/json-parse-error-dialog.component';
import { CommonModule } from '@angular/common';


@NgModule({
  imports: [
    AuthRoutingModule,
    SharedModule,
    CommonModule
  ],
  declarations: [
    AuthComponent,
    ProfilesComponent,
    JsonParseErrorDialogComponent
  ],
  entryComponents: [
    JsonParseErrorDialogComponent
  ],
})
export class AuthModule {}
