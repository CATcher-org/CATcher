import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TeamAcceptedComponent } from './team-accepted.component';

@NgModule({
  declarations: [TeamAcceptedComponent],
  exports: [TeamAcceptedComponent],
  imports: [CommonModule]
})
export class TeamAcceptedModule {}
