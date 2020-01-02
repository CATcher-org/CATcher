import {Component, EventEmitter, Input, OnInit, Output, ViewChild, ViewEncapsulation} from '@angular/core';
import {Issue} from '../../../core/models/issue.model';
import {MatSelect} from '@angular/material';
import {Team} from '../../../core/models/team.model';
import {IssueService} from '../../../core/services/issue.service';
import {ErrorHandlingService} from '../../../core/services/error-handling.service';
import {PermissionService} from '../../../core/services/permission.service';

@Component({
  selector: 'app-assignee-component',
  templateUrl: './assignee.component.html',
  styleUrls: ['./assignee.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class AssigneeComponent implements OnInit {
  teamMembers: string[];
  isInEditMode = false;
  assignees: string[];

  @Input() issue: Issue;
  @Input() team: Team;
  @Input() isEditable = true;

  @ViewChild(MatSelect) assigneeSelection: MatSelect;

  @Output() issueUpdated = new EventEmitter<Issue>();

  constructor(private issueService: IssueService, private errorHandlingService: ErrorHandlingService,
              public permissions: PermissionService) {
  }

  ngOnInit(): void {
    this.teamMembers = this.team.teamMembers.map((user) => user.loginId);
    this.assignees = this.issue.assignees.map(a => a.toLowerCase());
  }

  openSelector() {
    this.isInEditMode = true;
    this.assigneeSelection.open();
  }

  handleEditMode(isOpen) {
    if (!isOpen) {
      this.isInEditMode = false;
    }
  }

  updateAssignee(): void {
    const latestIssue = <Issue>{
      ...this.issue,
      assignees: this.assignees
    };
    this.issueService.updateIssue(latestIssue).subscribe((updatedIssue: Issue) => {
      this.issueUpdated.emit(latestIssue);
    }, (error) => {
      this.errorHandlingService.handleHttpError(error);
    });
  }
}
