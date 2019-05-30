import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormBuilder} from '@angular/forms';
import {Issue, ISSUE_LABELS} from '../../../core/models/issue.model';
import {IssueService} from '../../../core/services/issue.service';
import {ErrorHandlingService} from '../../../core/services/error-handling.service';
import {PermissionService} from '../../../core/services/permission.service';
import { Label } from '../../../core/models/label.model';
import { LabelService } from '../../../core/services/label.service';

@Component({
  selector: 'app-issue-label',
  templateUrl: './label.component.html',
  styleUrls: ['./label.component.css'],
})
export class LabelComponent implements OnInit {
  labelValues: Label[];
  labelColor: string;

  @Input() issue: Issue;
  @Input() attributeName: string;

  @Output() issueUpdated = new EventEmitter<Issue>();

  constructor(private issueService: IssueService,
              private formBuilder: FormBuilder,
              private errorHandlingService: ErrorHandlingService,
              private labelService: LabelService,
              public permissions: PermissionService) {
  }

  ngOnInit() {
    // Get the list of labels based on their type (severity, type, response)
    this.labelValues = this.labelService.getLabelList(this.attributeName);
    this.labelColor = this.labelService.getColorOfLabel(this.issue[this.attributeName]);
  }

  updateLabel(value: string) {
    this.issueService.updateIssue({
      ...this.issue,
      [this.attributeName]: value,
    }).subscribe((editedIssue: Issue) => {
      this.issueUpdated.emit(editedIssue);
      this.labelColor = this.labelService.getColorOfLabel(editedIssue[this.attributeName]);
    }, (error) => {
      this.errorHandlingService.handleHttpError(error);
    });
  }
}
