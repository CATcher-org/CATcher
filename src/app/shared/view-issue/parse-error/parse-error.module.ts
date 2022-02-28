import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ParseErrorComponent } from './parse-error.component';

@NgModule({
  exports: [ParseErrorComponent],
  declarations: [ParseErrorComponent],
  imports: [CommonModule]
})
export class ParseErrorModule {}
