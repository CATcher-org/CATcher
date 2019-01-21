import {Component, OnInit} from '@angular/core';
import {IssueService} from '../../core/services/issue.service';
import {FormBuilder, FormGroup, NgForm, Validators} from '@angular/forms';
import {ISSUE_TYPES, SEVERITIES} from '../../core/models/issue.model';

@Component({
  selector: 'app-new-issue',
  templateUrl: './new-issue.component.html',
  styleUrls: ['./new-issue.component.css']
})
export class NewIssueComponent implements OnInit {
  newIssueForm: FormGroup;
  severityValues = SEVERITIES;
  issueTypeValues = ISSUE_TYPES;

  constructor(private issueService: IssueService, private formBuilder: FormBuilder) { }

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
    this.issueService.createNewIssue(this.title, this.description, this.severity, this.type).subscribe((newIssue) => {
      this.issueService.updateLocalStore(newIssue);
      form.resetForm();
    }, (error) => {
      console.log(error);
    });
  }

  get title() {
    return this.newIssueForm.get('title').value;
  }

  get description() {
    return this.newIssueForm.get('description').value;
  }

  get severity() {
    return this.newIssueForm.get('severity').value;
  }

  get type() {
    return this.newIssueForm.get('type').value;
  }
}
