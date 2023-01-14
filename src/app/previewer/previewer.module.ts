import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MaterialModule } from '../shared/material.module';
import { PreviewerComponent } from './previewer.component';

@NgModule({
  declarations: [PreviewerComponent],
  imports: [CommonModule, FormsModule, MaterialModule, ReactiveFormsModule]
})
export class PreviewerModule {}
