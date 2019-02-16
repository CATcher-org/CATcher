import {Component, EventEmitter, Input, OnInit, Output, ViewChild, ViewEncapsulation} from '@angular/core';
import {Issue} from '../../../core/models/issue.model';
import {MatSelect} from '@angular/material';
import {Team} from '../../../core/models/team.model';
import {IssueService} from '../../../core/services/issue.service';
import {ErrorHandlingService} from '../../../core/services/error-handling.service';

@Component({
  selector: 'app-assignee-component',
  templateUrl: './assignee.component.html',
  styleUrls: ['./assignee.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class AssigneeComponent implements OnInit {

  @Input() issue: Issue;
  @Input() team: Team;
  @ViewChild(MatSelect) assigneeSelection: MatSelect;
  @Output() issueUpdated = new EventEmitter<Issue>();
  teamMembers: string[];

  constructor(private issueService: IssueService, private errorHandlingService: ErrorHandlingService) {
  }

  ngOnInit(): void {
    this.teamMembers = this.team.teamMembers.map((user) => user.loginId);
  }

  openSelector() {
    this.assigneeSelection.open();
  }

  updateAssignee(event): void {
    this.issueService.updateIssue({
      ...this.issue,
      assignees: event.value,
    }).subscribe((updatedIssue: Issue) => {
      this.issueUpdated.emit(updatedIssue);
    }, (error) => {
      this.errorHandlingService.handleHttpError(error);
    });
  }
}
