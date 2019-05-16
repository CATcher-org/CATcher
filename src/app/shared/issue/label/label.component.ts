import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormBuilder} from '@angular/forms';
import {Issue, ISSUE_LABELS} from '../../../core/models/issue.model';
import {IssueService} from '../../../core/services/issue.service';
import {ErrorHandlingService} from '../../../core/services/error-handling.service';
import {PermissionService} from '../../../core/services/permission.service';

@Component({
  selector: 'app-issue-label',
  templateUrl: './label.component.html',
  styleUrls: ['./label.component.css'],
})
export class LabelComponent implements OnInit {
  labelValues: string[];

  @Input() issue: Issue;
  @Input() attributeName: string;
  @Input() attributeColor: string;

  @Output() issueUpdated = new EventEmitter<Issue>();

  constructor(private issueService: IssueService,
              private formBuilder: FormBuilder,
              private errorHandlingService: ErrorHandlingService,
              public permissions: PermissionService) {
  }

  ngOnInit() {
    this.labelValues = ISSUE_LABELS[this.attributeName];
  }

  setLabelStyle(color: string) {
    const styles = {
      'background-color' : '#'.concat(color),
      'margin-top' : '5px',
      'border-radius' : '3px',
      'padding' : '3px',
    };
    return styles;
  }

  updateLabel(value: string) {
    this.issueService.updateIssue({
      ...this.issue,
      [this.attributeName]: value,
    }).subscribe((editedIssue: Issue) => {
      this.issueUpdated.emit(editedIssue);
    }, (error) => {
      this.errorHandlingService.handleHttpError(error);
    });
  }
}
