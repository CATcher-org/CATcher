import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PaginatorLocalStorageDirective } from '../../core/directives/paginator-local-storage.directive';
import { MaterialModule } from '../material.module';
import { IssueTablesComponent } from './issue-tables.component';

@NgModule({
  exports: [IssueTablesComponent],
  declarations: [IssueTablesComponent, PaginatorLocalStorageDirective],
  imports: [CommonModule, MaterialModule, RouterModule]
})
export class IssueTablesModule {}
