import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {IssueService} from '../../core/services/issue.service';
import {FormBuilder, FormControl, FormGroup, NgForm, Validators} from '@angular/forms';
import {Issue, RESPONSE, SEVERITY, SEVERITY_ORDER, TYPE} from '../../core/models/issue.model';
import {ErrorHandlingService} from '../../core/services/error-handling.service';
import {finalize, map} from 'rxjs/operators';
import {IssueComment, IssueComments} from '../../core/models/comment.model';
import {UserService} from '../../core/services/user.service';
import {Student} from '../../core/models/user.model';
import {BehaviorSubject, forkJoin, Observable} from 'rxjs';
import {IssueCommentService} from '../../core/services/issue-comment.service';

@Component({
  selector: 'app-new-team-response',
  templateUrl: './new-team-response.component.html',
  styleUrls: ['./new-team-response.component.css']
})
export class NewTeamResponseComponent implements OnInit {
  newTeamResponseForm: FormGroup;
  severityValues = Object.keys(SEVERITY);
  issueTypeValues = Object.keys(TYPE);
  responseList = Object.keys(RESPONSE);
  teamMembers: string[];
  duplicatedIssueList: Observable<Issue[]>;

  isFormPending = false;
  @Input() issue: Issue;
  @Input() comments: IssueComments;
  @Output() commentsUpdated = new EventEmitter<IssueComments>();
  @Output() issueUpdated = new EventEmitter<Issue>();

  constructor(private issueService: IssueService, private issueCommentService: IssueCommentService,
              private formBuilder: FormBuilder,
              private errorHandlingService: ErrorHandlingService,
              private userService: UserService) { }

  ngOnInit() {
    this.teamMembers = (<Student>this.userService.currentUser).team.teamMembers.map((member) => {
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
    forkJoin(this.issueCommentService.createIssueComment(this.issue.id, this.description.value, this.duplicateOf.value),
             this.issueService.updateIssue({
               ...this.issue,
              severity: this.severity.value,
              type: this.type.value,
              assignees: this.assignees.value,
              responseTag: this.responseTag.value,
              duplicated: this.duplicated.value,
    })).pipe(finalize(() => this.isFormPending = false)).subscribe((res) => {
      this.commentsUpdated.emit({
        ...this.comments,
        teamResponse: res[0],
      });
      this.issueUpdated.emit({
        ...res[1],
        duplicateOf: res[0]['duplicateOf'],
      });
      form.resetForm();
    }, (error) => {
      this.errorHandlingService.handleHttpError(error);
    });
  }

  dupIssueOptionIsDisabled(issue: Issue): boolean {
    return SEVERITY_ORDER[this.issue.severity] > SEVERITY_ORDER[issue.severity];
  }

  getDisabledDupOptionErrorText(issue: Issue): string {
    const reason = new Array<string>();
    if (this.dupIssueOptionIsDisabled(issue)) {
      if (SEVERITY_ORDER[this.issue.severity] > SEVERITY_ORDER[issue.severity]) {
        reason.push('Cannot set \'duplicate of\' to an issue of lower priority');
      }
    }
    return reason.join(', ');
  }

  handleChangeOfDuplicateCheckbox(event) {
    if (event.checked) {
      this.severity.setValue(this.issue.severity);
      this.type.setValue(this.issue.type);
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
