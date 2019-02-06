import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TutorComponent } from './tutor.component';
import { TutorRoutingModule } from './tutor-routing.module';

@NgModule({
  declarations: [TutorComponent],
  imports: [
    CommonModule,
    TutorRoutingModule
  ]
})
export class TutorModule { }
