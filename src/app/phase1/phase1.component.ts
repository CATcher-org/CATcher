import { Component, OnInit, ViewChild } from '@angular/core';
import { IssuesDataTable } from '../shared/issue-tables/IssuesDataTable';
import { BehaviorSubject } from 'rxjs';
import { Issue } from '../core/models/issue.model';
import { PermissionService } from '../core/services/permission.service';
import { UserService } from '../core/services/user.service';
import { ACTION_BUTTONS, IssueTablesComponent } from '../shared/issue-tables/issue-tables.component';

@Component({
  selector: 'app-phase1',
  templateUrl: './phase1.component.html',
  styleUrls: ['./phase1.component.css']
})
export class Phase1Component implements OnInit {

  readonly displayedColumns = ['id', 'title', 'type', 'severity', 'actions'];
  readonly actionButtons: ACTION_BUTTONS[] = [ACTION_BUTTONS.VIEW_IN_WEB, ACTION_BUTTONS.DELETE_ISSUE];

  @ViewChild(IssueTablesComponent) table: IssueTablesComponent;

  constructor(public permissions: PermissionService,
              public userService: UserService) {
  }

  ngOnInit() {
  }

  applyFilter(filterValue: string) {
    this.table.issues.filter = filterValue;
  }
}
