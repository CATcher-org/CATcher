import { Component, EventEmitter, Input, OnChanges, OnInit, Output, ViewChild, ViewContainerRef } from '@angular/core';
import { first } from 'rxjs/operators';
import { DialogService } from '../../..//core/services/dialog.service';
import { Issue } from '../../../core/models/issue.model';
import { Label } from '../../../core/models/label.model';
import { ErrorHandlingService } from '../../../core/services/error-handling.service';
import { IssueService } from '../../../core/services/issue.service';
import { LabelCategory, LabelService } from '../../../core/services/label.service';
import { LoadingService } from '../../../core/services/loading.service';
import { PermissionService } from '../../../core/services/permission.service';
import { PhaseService } from '../../../core/services/phase.service';

@Component({
  selector: 'app-issue-label',
  templateUrl: './label.component.html',
  styleUrls: ['./label.component.css'],
  providers: [LoadingService]
})
export class LabelComponent implements OnInit, OnChanges {
  // The container of the loading spinner
  @ViewChild('loadingSpinnerContainer', {
    read: ViewContainerRef,
    static: false
  })
  loadingSpinnerContainer: ViewContainerRef;

  labelValues: Label[];
  labelColor: string;
  labelDefinition?: string;
  isSavePending: boolean;

  @Input() issue: Issue;
  @Input() attributeName: LabelCategory;

  @Output() issueUpdated = new EventEmitter<Issue>();

  constructor(
    private issueService: IssueService,
    private errorHandlingService: ErrorHandlingService,
    private phaseService: PhaseService,
    public labelService: LabelService,
    public permissions: PermissionService,
    public dialogService: DialogService,
    public loadingService: LoadingService
  ) {}

  showSpinner(): void {
    this.loadingService.addViewContainerRef(this.loadingSpinnerContainer).showLoader();
    this.isSavePending = true;
  }

  hideSpinner(): void {
    this.loadingService.hideLoader();
    this.isSavePending = false;
  }

  ngOnInit() {
    // Get the list of labels based on their type (severity, type, response)
    this.labelValues = this.labelService.getLabelList(this.attributeName);
    // Build the loading service spinner
    this.loadingService
      .addAnimationMode('indeterminate')
      .addSpinnerOptions({ diameter: 15, strokeWidth: 2 })
      .addCssClasses(['mat-progress-spinner']);
  }

  ngOnChanges() {
    // Color will change when @Input issue changes
    this.labelColor = this.labelService.getColorOfLabel(this.attributeName, this.issue[this.attributeName]);
  }

  updateLabel(value: string) {
    this.showSpinner();
    const newIssue = this.issue.clone(this.phaseService.currentPhase);
    newIssue[this.attributeName] = value;
    this.issueService.updateIssue(newIssue).subscribe(
      (updatedIssue: Issue) => {
        this.issueUpdated.emit(updatedIssue);
        this.labelColor = this.labelService.getColorOfLabel(this.attributeName, updatedIssue[this.attributeName]);
        this.hideSpinner();
      },
      (error) => {
        this.errorHandlingService.handleError(error);
        this.hideSpinner();
      }
    );
    // Update labels of duplicate issues
    this.issueService
      .getDuplicateIssuesFor(this.issue)
      .pipe(first())
      .subscribe((issues: Issue[]) => {
        issues.forEach((issue: Issue) => {
          const newDuplicateIssue = issue.clone(this.phaseService.currentPhase);
          newDuplicateIssue[this.attributeName] = value;
          this.issueService.updateIssue(newDuplicateIssue);
        });
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
