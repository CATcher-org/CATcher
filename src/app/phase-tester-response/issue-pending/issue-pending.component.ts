import { Component, OnInit, ViewChild } from '@angular/core';
import { ACTION_BUTTONS, IssueTablesComponent, TABLE_COLUMNS } from '../../shared/issue-tables/issue-tables.component';
import { Issue, STATUS } from '../../core/models/issue.model';

@Component({
  selector: 'app-issue-pending',
  templateUrl: './issue-pending.component.html',
  styleUrls: ['./issue-pending.component.css']
})
export class IssuePendingComponent implements OnInit {

  @ViewChild(IssueTablesComponent) table: IssueTablesComponent;

  readonly displayedColumns = [
    TABLE_COLUMNS.ID,
    TABLE_COLUMNS.TITLE,
    TABLE_COLUMNS.TYPE,
    TABLE_COLUMNS.SEVERITY,
    TABLE_COLUMNS.ACTIONS
  ];
  readonly actionButtons: ACTION_BUTTONS[] = [
    ACTION_BUTTONS.VIEW_IN_WEB,
    ACTION_BUTTONS.RESPOND_TO_ISSUE,
    ACTION_BUTTONS.MARK_AS_RESPONDED
  ];
  filter: (issue: Issue) => boolean;

  constructor() { }

  ngOnInit() {
    this.filter = (issue: Issue) => {
      return (!issue.status || issue.status === STATUS.Incomplete);
    };
  }

  applyFilter(filterValue: string) {
    this.table.issues.filter = filterValue;
  }

}
