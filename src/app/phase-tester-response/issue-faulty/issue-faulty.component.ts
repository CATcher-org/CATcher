import { Component, OnInit, ViewChild } from '@angular/core';
import { Issue } from '../../core/models/issue.model';
import { TABLE_COLUMNS } from '../../shared/issue-tables/issue-tables-columns';
import { ACTION_BUTTONS, IssueTablesComponent } from '../../shared/issue-tables/issue-tables.component';

@Component({
  selector: 'app-issue-faulty',
  templateUrl: './issue-faulty.component.html',
  styleUrls: ['./issue-faulty.component.css']
})
export class IssueFaultyComponent implements OnInit {
  @ViewChild(IssueTablesComponent, { static: true }) table: IssueTablesComponent;
  readonly displayedColumns = [TABLE_COLUMNS.NO, TABLE_COLUMNS.TITLE, TABLE_COLUMNS.TYPE, TABLE_COLUMNS.SEVERITY, TABLE_COLUMNS.ACTIONS];
  readonly actionButtons: ACTION_BUTTONS[] = [ACTION_BUTTONS.VIEW_IN_WEB, ACTION_BUTTONS.FIX_ISSUE];
  filter: (issue: Issue) => boolean;

  ngOnInit() {
    this.filter = (issue: Issue) => issue.testerResponseError;
  }

  applyFilter(filterValue: string) {
    this.table.issues.filter = filterValue;
  }
}
