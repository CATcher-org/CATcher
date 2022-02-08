import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ParseErrorComponent } from './parse-error.component';

@NgModule({
  exports: [ParseErrorComponent],
  declarations: [ParseErrorComponent],
  imports: [CommonModule, RouterModule]
})
export class ParseErrorModule {}
