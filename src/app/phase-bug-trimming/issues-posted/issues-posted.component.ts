import { Component, OnInit, ViewChild } from '@angular/core';
import { PermissionService } from '../../core/services/permission.service';
import { UserService } from '../../core/services/user.service';
import { TABLE_COLUMNS } from '../../shared/issue-tables/issue-tables-columns';
import { ACTION_BUTTONS, IssueTablesComponent } from '../../shared/issue-tables/issue-tables.component';
import { Issue } from '../../core/models/issue.model';

@Component({
  selector: 'app-issues-posted',
  templateUrl: './issues-posted.component.html',
  styleUrls: ['./issues-posted.component.css']
})
export class IssuesPostedComponent implements OnInit {
  readonly displayedColumns = [TABLE_COLUMNS.NO, TABLE_COLUMNS.TITLE, TABLE_COLUMNS.TYPE, TABLE_COLUMNS.SEVERITY, TABLE_COLUMNS.ACTIONS];
  readonly actionButtons: ACTION_BUTTONS[] = [ACTION_BUTTONS.VIEW_IN_WEB, ACTION_BUTTONS.DELETE_ISSUE, ACTION_BUTTONS.FIX_ISSUE];
  filter: (issue: Issue) => boolean;

  @ViewChild(IssueTablesComponent, { static: true }) table: IssueTablesComponent;

  constructor(public permissions: PermissionService, public userService: UserService) {}

  ngOnInit() {
    this.filter = (issue: Issue): boolean => {
      return issue.isIssueOpened();
    };
  }

  applyFilter(filterValue: string) {
    this.table.issues.filter = filterValue;
  }
}
