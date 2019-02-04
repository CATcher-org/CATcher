import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Issue, ISSUE_TYPES, SEVERITIES} from '../core/models/issue.model';
import {IssueService} from '../core/services/issue.service';
import {FormBuilder, FormGroup, NgForm, Validators} from '@angular/forms';
import {ErrorHandlingService} from '../core/services/error-handling.service';
import {finalize} from 'rxjs/operators';

@Component({
  selector: 'app-issue',
  templateUrl: './issue.component.html',
  styleUrls: ['./issue.component.css']
})
export class IssueComponent implements OnInit {
  isPageLoading = true;
  issue: Issue;

  constructor(private issueService: IssueService,
              private route: ActivatedRoute,
              private formBuilder: FormBuilder,
              private errorHandlingService: ErrorHandlingService) { }

  ngOnInit() {
    const id = +this.route.snapshot.paramMap.get('issue_id');
    this.issueService.getIssue(id).subscribe((issue) => {
      console.log(issue);
      this.issue = issue;
      this.isPageLoading = false;
    }, (error) => {
      this.errorHandlingService.handleHttpError(error, () => this.ngOnInit());
    });
  }


  updateIssue(newIssue: Issue) {
    this.issue = newIssue;
  }
}
