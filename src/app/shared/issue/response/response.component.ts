import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormBuilder, FormGroup, NgForm, Validators} from '@angular/forms';
import {IssueService} from '../../../core/services/issue.service';
import {ErrorHandlingService} from '../../../core/services/error-handling.service';
import {finalize} from 'rxjs/operators';
import {PermissionService} from '../../../core/services/permission.service';
import {Phase, PhaseService} from '../../../core/services/phase.service';
import {Issue} from '../../../core/models/issue.model';

@Component({
  selector: 'app-issue-response',
  templateUrl: './response.component.html',
  styleUrls: ['./response.component.css'],
})
export class ResponseComponent implements OnInit {
  isSavePending = false;
  responseForm: FormGroup;

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

  constructor(private issueService: IssueService,
              private formBuilder: FormBuilder,
              private errorHandlingService: ErrorHandlingService,
              private permissions: PermissionService,
              private phaseService: PhaseService) {
  }

  ngOnInit() {
    this.responseForm = this.formBuilder.group({
      description: ['', Validators.required],
    });
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

    this.isSavePending = true;
    this.issueService.updateIssue(this.getUpdatedIssue()).pipe(finalize(() => {
      this.updateEditState.emit(false);
      this.isSavePending = false;
    })).subscribe((updatedIssue: Issue) => {
      this.issueUpdated.emit(updatedIssue);
      form.resetForm();
    }, (error) => {
      this.errorHandlingService.handleHttpError(error);
    });
  }

  canEditIssue(): boolean {
    switch (this.phaseService.currentPhase) {
      case Phase.phase2:
        return this.permissions.canCRUDTeamResponse();
      case Phase.phase3:
        return this.permissions.canCRUDTutorResponse();
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
