import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Issue, ISSUE_TYPES, SEVERITIES} from '../core/models/issue.model';
import {IssueService} from '../core/services/issue.service';
import {FormBuilder, FormGroup, NgForm, Validators} from '@angular/forms';

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

  constructor(private issueService: IssueService, private route: ActivatedRoute, private formBuilder: FormBuilder) { }

  ngOnInit() {
    const id = +this.route.snapshot.paramMap.get('issue_id');
    this.issueService.getIssue(id).subscribe((issue) => {
      this.issue = issue;
      this.isPageLoading = false;
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
  }

  submitForm(form: NgForm) {
    this.issueService.editIssue(this.issue.id, this.title, this.description, this.severity, this.type).subscribe((editedIssue: Issue) => {
      this.issue = editedIssue;
      this.issueService.updateLocalStore(editedIssue);
      this.isInEditMode = false;
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
