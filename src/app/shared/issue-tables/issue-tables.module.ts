import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IssueTablesComponent } from './issue-tables.component';
import { MaterialModule } from '../material.module';
import { RouterModule } from '@angular/router';

@NgModule({
  exports: [
    IssueTablesComponent
  ],
  declarations: [
    IssueTablesComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,
    RouterModule
  ]
})
export class IssueTablesModule { }
