import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TeamResponseParseErrorComponent } from './team-response-parse-error.component';

@NgModule({
  exports: [
    TeamResponseParseErrorComponent
  ],
  declarations: [
    TeamResponseParseErrorComponent
  ],
  imports: [
    CommonModule,
    RouterModule
  ]
})
export class TeamResponseParseErrorModule { }
