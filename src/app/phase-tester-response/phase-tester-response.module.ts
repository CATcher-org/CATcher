import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IssueTablesModule } from '../shared/issue-tables/issue-tables.module';
import { IssuesPendingComponent } from './issues-pending/issues-pending.component';
import { IssuesRespondedComponent } from './issues-responded/issues-responded.component';

@NgModule({
  exports: [
    IssuesPendingComponent,
    IssuesRespondedComponent
  ],
  declarations: [IssuesPendingComponent, IssuesRespondedComponent],
  imports: [
    CommonModule,
    IssueTablesModule
  ]
})
export class PhaseTesterResponseModule { }
