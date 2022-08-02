import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PreviewerRoutingModule } from './previewer-routing.module';

import { PreviewerComponent } from './previewer.component';

@NgModule({
  declarations: [PreviewerComponent],
  imports: [CommonModule, PreviewerRoutingModule, FormsModule, ReactiveFormsModule]
})
export class PreviewerModule {}
