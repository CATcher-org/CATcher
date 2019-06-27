import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IssueTablesComponent } from './issue-tables.component';

@NgModule({
  exports: [IssueTablesComponent],
  declarations: [IssueTablesComponent],
  imports: [
    CommonModule
  ]
})
export class IssueTablesModule { }
