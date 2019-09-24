import { Component, EventEmitter, Input, OnInit, Output, OnChanges } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Issue } from '../../../core/models/issue.model';
import { IssueService } from '../../../core/services/issue.service';
import { ErrorHandlingService } from '../../../core/services/error-handling.service';
import { PermissionService } from '../../../core/services/permission.service';
import { Label } from '../../../core/models/label.model';
import { LabelService } from '../../../core/services/label.service';
import { BaseIssue } from '../../../core/models/base-issue.model';

@Component({
  selector: 'app-issue-label',
  templateUrl: './label.component.html',
  styleUrls: ['./label.component.css'],
})
export class LabelComponent implements OnInit, OnChanges {
  labelValues: Label[];
  labelColor: string;

  @Input() issue: Issue;
  @Input() attributeName: string;

  @Output() issueUpdated = new EventEmitter<Issue>();

  constructor(private issueService: IssueService,
              private formBuilder: FormBuilder,
              private errorHandlingService: ErrorHandlingService,
              public labelService: LabelService,
              public permissions: PermissionService) {
  }

  ngOnInit() {
    // Get the list of labels based on their type (severity, type, response)
    this.labelValues = this.labelService.getLabelList(this.attributeName);
  }

  ngOnChanges() {
    // Color will change when @Input issue changes
    this.labelColor = this.labelService.getColorOfLabel(this.issue[this.attributeName]);
  }

  updateLabel(value: string) {
    const latestIssue = <BaseIssue>{
    ...this.issue,
      [this.attributeName]: value
    };
    this.issueService.updateIssue(latestIssue).subscribe((editedIssue: Issue) => {
      this.issueUpdated.emit(latestIssue);
      this.labelColor = this.labelService.getColorOfLabel(editedIssue[this.attributeName]);
    }, (error) => {
      this.errorHandlingService.handleHttpError(error);
    });
  }
}
