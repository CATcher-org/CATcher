import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormBuilder} from '@angular/forms';
import {Issue, ISSUE_LABELS} from '../../../core/models/issue.model';
import {IssueService} from '../../../core/services/issue.service';
import {ErrorHandlingService} from '../../../core/services/error-handling.service';
import {finalize} from 'rxjs/operators';

@Component({
  selector: 'app-issue-label',
  templateUrl: './label.component.html',
  styleUrls: ['./label.component.css'],
})
export class LabelComponent implements OnInit {
  labelValues: string[];

  @Input() issue: Issue;
  @Input() labelName: string;
  @Output() issueUpdated = new EventEmitter<Issue>();

  constructor(private issueService: IssueService,
              private formBuilder: FormBuilder,
              private errorHandlingService: ErrorHandlingService) {
  }

  ngOnInit() {
    this.labelValues = Object.keys(ISSUE_LABELS[this.labelName]);
  }

  updateLabel(value: string) {
    this.issueService.updateIssue({
      ...this.issue,
      [this.labelName]: value,
    }).pipe(finalize(() => {
    })).subscribe((editedIssue: Issue) => {
      this.issueService.updateLocalStore(editedIssue);
      this.issueUpdated.emit(editedIssue);
    }, (error) => {
      this.errorHandlingService.handleHttpError(error);
    });
  }
}
