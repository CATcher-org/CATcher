import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Issue } from '../../../core/models/issue.model';
import { IssueService } from '../../../core/services/issue.service';
import { ErrorHandlingService } from '../../../core/services/error-handling.service';

@Component({
  selector: 'app-unsure-checkbox',
  templateUrl: './unsure-checkbox.component.html',
  styleUrls: ['./unsure-checkbox.component.css']
})
export class UnsureCheckboxComponent implements OnInit {

  @Input() issue: Issue;

  @Output() issueUpdated = new EventEmitter<Issue>();

  constructor(private issueService: IssueService,
    private errorHandlingService: ErrorHandlingService) { }

  ngOnInit() {
  }

  handleChangeOfUnsureCheckbox(event) {
    let UNSURE = false;

    if (event.checked) {
      UNSURE = true;
    }

    this.issueService.updateIssue(<Issue>{
      ...this.issue,
      unsure: UNSURE,
    }).subscribe((updatedIssue: Issue) => {
      this.issueUpdated.emit(updatedIssue);
    }, (error) => {
      this.errorHandlingService.handleError(error);
    });
  }

}
