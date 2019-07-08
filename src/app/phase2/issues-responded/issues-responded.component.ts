import { Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { IssueService } from '../../core/services/issue.service';
import { IssuesDataTable } from '../../shared/issue-tables/IssuesDataTable';
import { Issue } from '../../core/models/issue.model';
import { UserService } from '../../core/services/user.service';
import { UserRole } from '../../core/models/user.model';
import { ACTION_BUTTONS, IssueTablesComponent } from '../../shared/issue-tables/issue-tables.component';

@Component({
  selector: 'app-issues-responded',
  templateUrl: './issues-responded.component.html',
  styleUrls: ['./issues-responded.component.css'],
})
export class IssuesRespondedComponent implements OnInit, OnChanges {
  displayedColumns: string[];
  filter: (issue: Issue) => boolean;

  readonly actionButtons: ACTION_BUTTONS[] = [ACTION_BUTTONS.VIEW_IN_WEB, ACTION_BUTTONS.MARK_AS_PENDING];

  @Input() teamFilter: string;

  @ViewChild(IssueTablesComponent) table: IssueTablesComponent;

  constructor(public issueService: IssueService, public userService: UserService) {
    if (userService.currentUser.role === UserRole.Student) {
      this.displayedColumns = ['id', 'title', 'type', 'severity', 'responseTag', 'assignees', 'duplicatedIssues', 'actions'];
    } else {
      this.displayedColumns = ['id', 'title', 'teamAssigned', 'type', 'severity', 'responseTag', 'assignees', 'duplicatedIssues',
        'actions'];
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!changes.teamFilter.isFirstChange()) {
      this.table.issues.teamFilter = changes.teamFilter.currentValue;
    }
  }

  ngOnInit() {
    this.filter = (issue: Issue) => {
      return this.issueService.hasResponse(issue.id) && !issue.duplicateOf &&
        (issue.status === 'Done');
    };
  }

  applyFilter(filterValue: string) {
    this.table.issues.filter = filterValue;
  }
}
