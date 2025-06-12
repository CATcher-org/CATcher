import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IssueComponent } from '../issue/issue/issue.component';
import { ViewIssueModule } from '../view-issue/view-issue.module';

@NgModule({
  imports: [CommonModule, ViewIssueModule],
  declarations: [IssueComponent],
  exports: [IssueComponent]
})
export class IssueViewModule {}
