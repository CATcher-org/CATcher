import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormBuilder, FormGroup, NgForm, Validators} from '@angular/forms';
import {Issue, RESPONSE, SEVERITY, SEVERITY_ORDER, TYPE} from '../../core/models/issue.model';
import {Observable} from 'rxjs';
import {IssueService} from '../../core/services/issue.service';
import {ErrorHandlingService} from '../../core/services/error-handling.service';
import {finalize, map} from 'rxjs/operators';

@Component({
  selector: 'app-new-tutor-response',
  templateUrl: './new-tutor-response.component.html',
  styleUrls: ['./new-tutor-response.component.css']
})
export class NewTutorResponseComponent implements OnInit {

  newTutorResponseForm: FormGroup;
  duplicatedIssueList: Observable<Issue[]>;
  teamMembers: string[];

  isFormPending = false;
  @Input() issue: Issue;
  @Output() issueUpdated = new EventEmitter<Issue>();

  constructor(private issueService: IssueService,
              private formBuilder: FormBuilder,
              private errorHandlingService: ErrorHandlingService) { }

  ngOnInit() {
    this.duplicatedIssueList = this.getDupIssueList();
    this.newTutorResponseForm = this.formBuilder.group({
      description: ['', Validators.required],
      severity: [this.issue.severity, Validators.required],
      type: [this.issue.type, Validators.required],
      responseTag: [this.issue.responseTag, Validators.required],
      assignees: [this.issue.assignees],
      duplicated: [this.issue.duplicated && !!this.issue.duplicateOf],
      duplicateOf: [this.issue.duplicated ? this.issue.duplicateOf || '' : '']
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

  private getDupIssueList(): Observable<Issue[]> {
    return this.issueService.issues$.pipe(map((issues) => {
      return issues.filter((issue) => {
        return this.issue.id !== issue.id;
      });
    }));
  }

  submitNewTutorResponseForm(form: NgForm) {
    if (this.newTutorResponseForm.invalid) {
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
      duplicateOf: this.duplicateOf.value,
      tutorResponse: this.description.value,
    }).pipe(finalize(() => {
      this.isFormPending = false;
      form.resetForm();
    })).subscribe((updatedIssue) => {
      this.issueUpdated.emit(updatedIssue);
    }, (error) => {
      this.errorHandlingService.handleHttpError(error);
    });
  }

  get severity() {
    return this.newTutorResponseForm.get('severity');
  }

  get description() {
    return this.newTutorResponseForm.get('description');
  }

  get type() {
    return this.newTutorResponseForm.get('type');
  }

  get assignees() {
    return this.newTutorResponseForm.get('assignees');
  }

  get duplicated() {
    return this.newTutorResponseForm.get('duplicated');
  }

  get duplicateOf() {
    return this.newTutorResponseForm.get('duplicateOf');
  }

  get responseTag() {
    return this.newTutorResponseForm.get('responseTag');
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

  handleChangeOfTodoCheckbox(event, todo, index) {
    if (event.checked) {
      this.issue.todoList[index] = '- [x]' + todo.substring(5);
    } else {
      this.issue.todoList[index] = '- [ ]' + todo.substring(5);
    }
  }

  trackTodoList(index: number, item: string[]): string {
    return item[index];
  }

  isTodoChecked(todo): boolean {
    if (todo.charAt(3) === 'x') {
      return true;
    }
    return false;
  }

}
