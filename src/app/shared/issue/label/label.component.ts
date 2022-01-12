import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { DialogService } from '../../..//core/services/dialog.service';
import { Issue } from '../../../core/models/issue.model';
import { Label } from '../../../core/models/label.model';
import { ErrorHandlingService } from '../../../core/services/error-handling.service';
import { IssueService } from '../../../core/services/issue.service';
import { LabelService } from '../../../core/services/label.service';
import { PermissionService } from '../../../core/services/permission.service';
import { PhaseService } from '../../../core/services/phase.service';

@Component({
  selector: 'app-issue-label',
  templateUrl: './label.component.html',
  styleUrls: ['./label.component.css'],
})
export class LabelComponent implements OnInit, OnChanges {
  labelValues: Label[];
  labelColor: string;
  labelDefinition?: string;

  @Input() issue: Issue;
  @Input() attributeName: string;

  @Output() issueUpdated = new EventEmitter<Issue>();

  constructor(private issueService: IssueService,
              private errorHandlingService: ErrorHandlingService,
              private phaseService: PhaseService,
              public labelService: LabelService,
              public permissions: PermissionService,
              public dialogService: DialogService) {
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
    const newIssue = this.issue.clone(this.phaseService.currentPhase);
    newIssue[this.attributeName] = value;
    this.issueService.updateIssue(newIssue).subscribe((updatedIssue: Issue) => {
      this.issueUpdated.emit(updatedIssue);
      this.labelColor = this.labelService.getColorOfLabel(updatedIssue[this.attributeName]);
    }, (error) => {
      this.errorHandlingService.handleError(error);
    });
  }

  openDefinitionPage(value: Label): void {
    this.labelDefinition = this.labelService.getLabelDefinition(value.labelValue, value.labelCategory);
    this.dialogService.openLabelDefinitionDialog(value.getFormattedName(), this.labelDefinition);
  }

  hasLabelDefinition(value: Label): boolean {
    return this.labelService.getLabelDefinition(value.labelValue, value.labelCategory) !== null;
  }
}
