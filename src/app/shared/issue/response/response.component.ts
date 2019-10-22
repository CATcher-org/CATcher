import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormBuilder, FormGroup, NgForm, Validators} from '@angular/forms';
import {IssueService} from '../../../core/services/issue.service';
import {ErrorHandlingService} from '../../../core/services/error-handling.service';
import {finalize} from 'rxjs/operators';
import {PermissionService} from '../../../core/services/permission.service';
import {Phase, PhaseService} from '../../../core/services/phase.service';
import {Issue} from '../../../core/models/issue.model';
import {IssueCommentService} from '../../../core/services/issue-comment.service';
import {IssueComment} from '../../../core/models/comment.model';
import { SUBMIT_BUTTON_TEXT } from '../../view-issue/view-issue.component';

@Component({
  selector: 'app-issue-response',
  templateUrl: './response.component.html',
  styleUrls: ['./response.component.css'],
})
export class ResponseComponent implements OnInit {
  isSavePending = false;
  responseForm: FormGroup;

  submitButtonText: string;

  readonly TITLE = {
    'teamResponse': 'Team\'s Response',
    'tutorResponse': 'Tutor\'s Response'
  };

  readonly POSTER = {
    'teamResponse': 'Team',
    'tutorResponse': 'Tutor'
  };

  readonly ACTION = {
    'teamResponse': 'responded',
    'tutorResponse': 'responded'
  };

  @Input() issue: Issue;
  @Input() attributeName: string;
  @Input() isEditing: boolean;
  @Output() issueUpdated = new EventEmitter<Issue>();
  @Output() updateEditState = new EventEmitter<boolean>();
  @Output() commentUpdated = new EventEmitter<IssueComment>();

  constructor(private issueService: IssueService,
              private formBuilder: FormBuilder,
              private issueCommentService: IssueCommentService,
              private errorHandlingService: ErrorHandlingService,
              private permissions: PermissionService,
              private phaseService: PhaseService) {
  }

  ngOnInit() {
    this.responseForm = this.formBuilder.group({
      description: ['', Validators.required],
    });
    this.submitButtonText = SUBMIT_BUTTON_TEXT.SAVE;
  }

  changeToEditMode() {
    this.updateEditState.emit(true);
    this.responseForm.setValue({
      description: this.issue[this.attributeName] || ''
    });
  }

  cancelEditMode() {
    this.updateEditState.emit(false);
  }

  updateResponse(form: NgForm) {
    if (this.responseForm.invalid) {
      return;
    }
    const latestIssue = this.getUpdatedIssue();
    this.isSavePending = true;
    this.issueService.updateIssue(latestIssue).subscribe((updatedIssue: Issue) => {

      if (this.phaseService.currentPhase === Phase.phaseTeamResponse) {
        // For Team Response phase, where the items are in the issue's comment
        latestIssue.issueComment.description = this.issueCommentService.
        createGithubTeamResponse(latestIssue.teamResponse, latestIssue.duplicateOf);

        this.issueCommentService.updateIssueComment(latestIssue.issueComment).subscribe(
          (updatedComment) => {
            this.commentUpdated.emit(updatedComment);
            this.updateEditState.emit(false);
            this.isSavePending = false;
            updatedIssue.issueComment = updatedComment;
            updatedIssue.teamResponse = this.issueService.parseTeamResponseForTeamResponsePhase(updatedComment.description);
            updatedIssue.duplicateOf = +this.issueService.parseDuplicateOfForTeamResponsePhase(updatedComment.description);
            this.issueUpdated.emit(updatedIssue);
            form.resetForm();
          }, (error) => {
            this.errorHandlingService.handleHttpError(error);
          });
      } else {
        this.issueUpdated.emit(updatedIssue);
        form.resetForm();
      }
    }, (error) => {
      this.errorHandlingService.handleHttpError(error);
    });
  }

  canEditIssue(): boolean {
    switch (this.phaseService.currentPhase) {
      case Phase.phaseTeamResponse:
        return this.permissions.isTeamResponseEditable();
      case Phase.phaseModeration:
        return this.permissions.isTutorResponseEditable();
      default:
        return false;
    }
  }

  private createUpdatedIssue(updatedIssue: Issue) {
    return <Issue>{
      ...this.issue,
      [this.attributeName]: updatedIssue
    };
  }

  private getUpdatedIssue(): Issue {
    return <Issue> {
      ...this.issue,
      [this.attributeName]: this.responseForm.get('description').value
    };
  }
}
