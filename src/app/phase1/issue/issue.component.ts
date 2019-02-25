import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Issue} from '../../core/models/issue.model';
import {IssueService} from '../../core/services/issue.service';
import {FormBuilder} from '@angular/forms';
import {ErrorHandlingService} from '../../core/services/error-handling.service';

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
