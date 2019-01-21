import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Issue, ISSUE_TYPES, SEVERITIES} from '../core/models/issue.model';
import {IssueService} from '../core/services/issue.service';
import {FormBuilder, FormGroup, NgForm, Validators} from '@angular/forms';
import {ErrorHandlingService} from '../core/services/error-handling.service';

@Component({
  selector: 'app-issue',
  templateUrl: './issue.component.html',
  styleUrls: ['./issue.component.css']
})
export class IssueComponent implements OnInit {
  isPageLoading = true;
  isInEditMode = false;
  severityValues = SEVERITIES;
  issueTypeValues = ISSUE_TYPES;

  issue: Issue;
  editIssueForm: FormGroup;

  constructor(private issueService: IssueService,
              private route: ActivatedRoute,
              private formBuilder: FormBuilder,
              private errorHandlingService: ErrorHandlingService) { }

  ngOnInit() {
    const id = +this.route.snapshot.paramMap.get('issue_id');
    this.issueService.getIssue(id).subscribe((issue) => {
      this.issue = issue;
      this.isPageLoading = false;
    }, (error) => {
      this.errorHandlingService.handleHttpError(error);
    });
    this.editIssueForm = this.formBuilder.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      severity: ['', Validators.required],
      type: ['', Validators.required],
    });
  }

  changeToEditMode() {
    this.editIssueForm.setValue({
      title: this.issue.title,
      description: this.issue.description,
      severity: this.issue.severity,
      type: this.issue.type,
    });
    this.isInEditMode = true;
  }

  cancelEditMode() {
    this.isInEditMode = false;
    this.editIssueForm.reset();
  }

  submitForm(form: NgForm) {
    this.issueService.editIssue(this.issue.id, this.title, this.description, this.severity, this.type).subscribe((editedIssue: Issue) => {
      this.issue = editedIssue;
      this.issueService.updateLocalStore(editedIssue);
      form.resetForm();
      this.isInEditMode = false;
    }, (error) => {
      this.errorHandlingService.handleHttpError(error);
    });
  }

  get title() {
    return this.editIssueForm.get('title').value;
  }

  get description() {
    return this.editIssueForm.get('description').value;
  }

  get severity() {
    return this.editIssueForm.get('severity').value;
  }

  get type() {
    return this.editIssueForm.get('type').value;
  }
}
