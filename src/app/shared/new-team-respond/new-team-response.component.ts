import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { IssueService } from '../../core/services/issue.service';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { Issue, SEVERITY_ORDER, STATUS } from '../../core/models/issue.model';
import { ErrorHandlingService } from '../../core/services/error-handling.service';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { LabelService } from '../../core/services/label.service';
import { IssueCommentService } from '../../core/services/issue-comment.service';
import { IssueComment } from '../../core/models/comment.model';

@Component({
  selector: 'app-new-team-response',
  templateUrl: './new-team-response.component.html',
  styleUrls: ['./new-team-response.component.css']
})
export class NewTeamResponseComponent implements OnInit {
  newTeamResponseForm: FormGroup;
  teamMembers: string[];
  duplicatedIssueList: Observable<Issue[]>;

  isFormPending = false;
  @Input() issue: Issue;
  @Output() issueUpdated = new EventEmitter<Issue>();
  @Output() updatedCommentEmitter = new EventEmitter<IssueComment>();

  constructor(private issueService: IssueService,
              private formBuilder: FormBuilder,
              private issueCommentService: IssueCommentService,
              public labelService: LabelService,
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
  }

  submitNewTeamResponse(form: NgForm) {
    if (this.newTeamResponseForm.invalid) {
      return;
    }
    this.isFormPending = true;
    const latestIssue = this.getUpdatedIssue();

    this.issueService.updateIssue(latestIssue)
      .subscribe(() => {

        // New Team Response has no pre-existing comments hence new comment will be added.
        const newCommentDescription = this.issueCommentService.createGithubTeamResponse(this.description.value, this.duplicateOf.value);
        this.issueCommentService.createIssueComment(this.issue.id, newCommentDescription)
          .subscribe((newComment: IssueComment) => {
            latestIssue.teamResponse = this.description.value;
            latestIssue.duplicateOf = this.duplicateOf.value === '' ? undefined : this.duplicateOf.value;
            latestIssue.issueComment = newComment;
            this.issueUpdated.emit(latestIssue);
            this.updatedCommentEmitter.emit(newComment);
            form.resetForm();
          });
      }, (error) => {
        this.errorHandlingService.handleHttpError(error);
      });
  }

  getUpdatedIssue() {
    return <Issue>{
      ...this.issue,
      severity: this.severity.value,
      type: this.type.value,
      assignees: this.assignees.value,
      responseTag: this.responseTag.value,
      duplicated: this.duplicated.value,
      status: STATUS.Done,
      teamResponse: this.description.value,
      duplicateOf: this.duplicateOf.value
    };
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
