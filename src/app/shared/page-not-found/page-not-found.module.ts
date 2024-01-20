import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageNotFoundComponent } from './page-not-found.component';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [PageNotFoundComponent],
  imports: [CommonModule, RouterModule.forChild([{ path: '', component: PageNotFoundComponent }])]
})
export class PageNotFoundModule {}
