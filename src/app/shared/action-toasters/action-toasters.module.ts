import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MaterialModule } from '../material.module';
import { UndoActionComponent } from './undo-action/undo-action.component';

@NgModule({
  imports: [CommonModule, MaterialModule],
  declarations: [UndoActionComponent],
  exports: [UndoActionComponent]
})
export class ActionToasterModule {}
