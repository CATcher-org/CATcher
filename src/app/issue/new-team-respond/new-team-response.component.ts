import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {IssueService} from '../../core/services/issue.service';
import {FormBuilder, FormGroup, NgForm, Validators} from '@angular/forms';
import {Issue, RESPONSE, SEVERITY, TYPE} from '../../core/models/issue.model';
import {ErrorHandlingService} from '../../core/services/error-handling.service';
import {finalize} from 'rxjs/operators';
import {IssueComment, IssueComments} from '../../core/models/comment.model';
import {UserService} from '../../core/services/user.service';
import {Student} from '../../core/models/user.model';
import {forkJoin} from 'rxjs';
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
    this.newTeamResponseForm = this.formBuilder.group({
      description: ['', Validators.required],
      severity: [this.issue.severity, Validators.required],
      type: [this.issue.type, Validators.required],
      responseTag: [this.issue.responseTag],
      assignees: [this.issue.assignees],
    });
  }

  submitNewTeamResponse(form: NgForm) {
    if (this.newTeamResponseForm.invalid) {
      return;
    }
    this.isFormPending = true;
    forkJoin(this.issueCommentService.createIssueComment(this.issue.id, this.description.value), this.issueService.updateIssue({
      ...this.issue,
      severity: this.severity.value,
      type: this.type.value,
      assignees: this.assignees.value,
      responseTag: this.responseTag.value,
    })).pipe(finalize(() => this.isFormPending = false)).subscribe((res) => {
      console.log(res[1]);
      this.commentsUpdated.emit({
        ...this.comments,
        ['teamResponse']: res[0],
      });
      this.issueUpdated.emit(res[1]);
      form.resetForm();
    }, (error) => {
      this.errorHandlingService.handleHttpError(error);
    });
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
}
