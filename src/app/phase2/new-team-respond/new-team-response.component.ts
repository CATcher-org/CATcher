import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {IssueService} from '../../core/services/issue.service';
import {FormBuilder, FormGroup, NgForm, Validators} from '@angular/forms';
import {Issue, RESPONSE, SEVERITY, SEVERITY_ORDER, STATUS, TYPE} from '../../core/models/issue.model';
import {ErrorHandlingService} from '../../core/services/error-handling.service';
import {finalize, map} from 'rxjs/operators';
import {Observable} from 'rxjs';
import {LabelService} from '../../core/services/label.service';

@Component({
  selector: 'app-new-team-response',
  templateUrl: './new-team-response.component.html',
  styleUrls: ['./new-team-response.component.css']
})
export class NewTeamResponseComponent implements OnInit {
  newTeamResponseForm: FormGroup;
  severityValues = this.labelService.getLabelList('severity');
  issueTypeValues = this.labelService.getLabelList('type');
  responseList = this.labelService.getLabelList('responseTag');
  teamMembers: string[];
  duplicatedIssueList: Observable<Issue[]>;
  selectedSeverityColor: string;
  selectedTypeColor: string;
  selectedResponseColor: string;

  isFormPending = false;
  @Input() issue: Issue;
  @Output() issueUpdated = new EventEmitter<Issue>();

  constructor(private issueService: IssueService,
              private formBuilder: FormBuilder,
              private labelService: LabelService,
              private errorHandlingService: ErrorHandlingService) { }

  ngOnInit() {
    this.teamMembers = this.issue.teamAssigned.teamMembers.map((member) => {
      return member.loginId;
    });
    this.duplicatedIssueList = this.getDupIssueList();
    this.newTeamResponseForm = this.formBuilder.group({
      description: ['', Validators.required],
      severity: [this.issue.severity, Validators.required],
      type: [this.issue.type, Validators.required],
      responseTag: [this.issue.responseTag, Validators.required],
      assignees: [this.issue.assignees],
      duplicated: [false],
      duplicateOf: ['']
    });
    this.duplicated.valueChanges.subscribe(checked => {
      if (checked) {
        this.duplicateOf.setValidators(Validators.required);
        this.responseTag.setValidators(null);
      } else {
        this.duplicateOf.setValidators(null);
        this.responseTag.setValidators(Validators.required);
      }
      this.duplicateOf.updateValueAndValidity();
      this.responseTag.updateValueAndValidity();
    });

    if (this.issue.severity === '') {
      this.selectedSeverityColor = 'ffffff';
    } else {
      this.selectedSeverityColor = this.issue.severityColor;
    }

    if (this.issue.type === '') {
      this.selectedTypeColor = 'ffffff';
    } else {
      this.selectedTypeColor = this.issue.typeColor;
    }

    if (this.issue.responseTag === '') {
      this.selectedResponseColor = 'ffffff';
    } else {
      this.selectedResponseColor = this.issue.responseColor;
    }
  }

  submitNewTeamResponse(form: NgForm) {
    if (this.newTeamResponseForm.invalid) {
      return;
    }
    this.isFormPending = true;
    this.issueService.updateIssue({
      ...this.issue,
      severity: this.severity.value,
      type: this.type.value,
      assignees: this.assignees.value,
      responseTag: this.responseTag.value,
      duplicated: this.duplicated.value,
      status: STATUS.Done,
      teamResponse: this.description.value,
      duplicateOf: this.duplicateOf.value,
    }).pipe(finalize(() => this.isFormPending = false)).subscribe((updatedIssue: Issue) => {
      this.issueUpdated.emit(updatedIssue);
      form.resetForm();
    }, (error) => {
      this.errorHandlingService.handleHttpError(error);
    });
  }

  dupIssueOptionIsDisabled(issue: Issue): boolean {
    return SEVERITY_ORDER[this.severity.value] > SEVERITY_ORDER[issue.severity] || (issue.duplicated || !!issue.duplicateOf);
  }

  getDisabledDupOptionErrorText(issue: Issue): string {
    const reason = new Array<string>();
    if (this.dupIssueOptionIsDisabled(issue)) {
      if (SEVERITY_ORDER[this.severity.value] > SEVERITY_ORDER[issue.severity]) {
        reason.push('Issue of lower priority');
      } else if (issue.duplicated || !!issue.duplicateOf) {
        reason.push('A duplicated issue');
      }
    }
    return reason.join(', ');
  }

  handleChangeOfDuplicateCheckbox(event) {
    if (event.checked) {
      this.responseTag.setValue('');
      this.assignees.setValue([]);
      this.responseTag.markAsUntouched();
    } else {
      this.duplicateOf.setValue('');
      this.duplicateOf.markAsUntouched();
    }
  }

  private getDupIssueList(): Observable<Issue[]> {
    return this.issueService.issues$.pipe(map((issues) => {
      return issues.filter((issue) => {
        return this.issue.id !== issue.id;
      });
    }));
  }

  setSelectedLabelColor(labelValue: string, labelType: string) {
    switch (labelType) {
      case 'severity':
        this.selectedSeverityColor = this.severityValues.filter(x => x.labelValue === labelValue)[0].labelColor;
        break;
      case 'type':
        this.selectedTypeColor = this.issueTypeValues.filter(x => x.labelValue === labelValue)[0].labelColor;
        break;
      case 'responseTag':
        this.selectedResponseColor = this.responseList.filter(x => x.labelValue === labelValue)[0].labelColor;
        break;
    }
  }

  get description() {
    return this.newTeamResponseForm.get('description');
  }

  get severity() {
    return this.newTeamResponseForm.get('severity');
  }

  get type() {
    return this.newTeamResponseForm.get('type');
  }

  get assignees() {
    return this.newTeamResponseForm.get('assignees');
  }

  get responseTag() {
    return this.newTeamResponseForm.get('responseTag');
  }

  get duplicated() {
    return this.newTeamResponseForm.get('duplicated');
  }

  get duplicateOf() {
    return this.newTeamResponseForm.get('duplicateOf');
  }
}
