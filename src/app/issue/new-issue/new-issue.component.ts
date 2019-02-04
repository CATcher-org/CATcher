import {Component, OnInit} from '@angular/core';
import {IssueService} from '../../core/services/issue.service';
import {FormBuilder, FormGroup, NgForm, Validators} from '@angular/forms';
import {ISSUE_TYPES, SEVERITIES} from '../../core/models/issue.model';
import {ErrorHandlingService} from '../../core/services/error-handling.service';
import {Router} from '@angular/router';
import {finalize} from 'rxjs/operators';

@Component({
  selector: 'app-new-issue',
  templateUrl: './new-issue.component.html',
  styleUrls: ['./new-issue.component.css']
})
export class NewIssueComponent implements OnInit {
  newIssueForm: FormGroup;
  severityValues = SEVERITIES;
  issueTypeValues = ISSUE_TYPES;
  isFormPending = false;

  constructor(private issueService: IssueService, private formBuilder: FormBuilder,
              private errorHandlingService: ErrorHandlingService,
              private router: Router) { }

  ngOnInit() {
    this.newIssueForm = this.formBuilder.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      severity: ['', Validators.required],
      type: ['', Validators.required],
    });
  }

  submitNewIssue(form: NgForm) {
    if (this.newIssueForm.invalid) {
      return;
    }
    this.isFormPending = true;
    this.issueService.createNewIssue(this.title.value, this.description.value,
      this.severity.value, this.type.value).pipe(finalize(() => this.isFormPending = false))
      .subscribe(
        newIssue => {
          this.issueService.updateLocalStore(newIssue);
          this.router.navigateByUrl(`issues/${newIssue.id}`);
          form.resetForm();
          },
          error => {
          this.errorHandlingService.handleHttpError(error);
        });
  }

  get title() {
    return this.newIssueForm.get('title');
  }

  get description() {
    return this.newIssueForm.get('description');
  }

  get severity() {
    return this.newIssueForm.get('severity');
  }

  get type() {
    return this.newIssueForm.get('type');
  }
}
