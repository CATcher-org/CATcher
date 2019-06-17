import { NgModule } from '@angular/core';
import {AuthComponent} from './auth.component';
import {AuthRoutingModule} from './auth-routing.module';
import {SharedModule} from '../shared/shared.module';
import { ProfilesComponent } from './profiles/profiles.component';
import { JsonParseErrorDialogComponent } from './profiles/json-parse-error-dialog/json-parse-error-dialog.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';


@NgModule({
  imports: [
    AuthRoutingModule,
    SharedModule,
    BrowserModule,
    BrowserAnimationsModule
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
