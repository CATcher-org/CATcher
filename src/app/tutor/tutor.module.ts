import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TutorComponent } from './tutor.component';
import { TutorRoutingModule } from './tutor-routing.module';
import { SecondPhaseTutorComponent } from './second-phase-tutor/second-phase-tutor.component';

@NgModule({
  declarations: [TutorComponent, SecondPhaseTutorComponent],
  imports: [
    CommonModule,
    TutorRoutingModule
  ]
})
export class TutorModule { }
