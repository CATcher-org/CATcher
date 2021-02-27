import { Component, OnInit, ViewChild } from '@angular/core';
import { ACTION_BUTTONS, IssueTablesComponent } from '../../shared/issue-tables/issue-tables.component';
import { TABLE_COLUMNS } from '../../shared/issue-tables/issue-tables-columns';
import { Issue, STATUS } from '../../core/models/issue.model';

@Component({
  selector: 'app-issue-responded',
  templateUrl: './issue-responded.component.html',
  styleUrls: ['./issue-responded.component.css']
})
export class IssueRespondedComponent implements OnInit {

  @ViewChild(IssueTablesComponent) table: IssueTablesComponent;
  readonly displayedColumns  = [
    TABLE_COLUMNS.ID,
    TABLE_COLUMNS.TITLE,
    TABLE_COLUMNS.TYPE,
    TABLE_COLUMNS.SEVERITY,
    TABLE_COLUMNS.ACTIONS
  ];
  readonly actionButtons: ACTION_BUTTONS[] = [
    ACTION_BUTTONS.VIEW_IN_WEB,
    ACTION_BUTTONS.MARK_AS_PENDING,
    ACTION_BUTTONS.FIX_ISSUE
  ];
  filter: (issue: Issue) => boolean;

  constructor() { }

  ngOnInit() {
    this.filter = (issue: Issue) => {
      return (issue.status === STATUS.Done) && !!issue.issueComment;
    };
  }

  applyFilter(filterValue: string) {
    this.table.issues.filter = filterValue;
  }

}
