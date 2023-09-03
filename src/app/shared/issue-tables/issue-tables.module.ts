import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ItemsPerPageDirective } from '../../core/directives/item-per-page.directive';
import { MaterialModule } from '../material.module';
import { IssueTablesComponent } from './issue-tables.component';

@NgModule({
  exports: [IssueTablesComponent],
  declarations: [IssueTablesComponent, ItemsPerPageDirective],
  imports: [CommonModule, MaterialModule, RouterModule]
})
export class IssueTablesModule {}
