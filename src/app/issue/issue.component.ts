import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Issue} from '../core/models/issue.model';
import {IssueService} from '../core/services/issue.service';
import {FormBuilder} from '@angular/forms';
import {ErrorHandlingService} from '../core/services/error-handling.service';
import {flatMap, map} from 'rxjs/operators';
import {of} from 'rxjs';
import {IssueComment} from '../core/models/comment.model';

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
    this.initializeIssue();
  }


  updateIssue(newIssue: Issue) {
    this.issue = newIssue;
    this.issueService.updateLocalStore(newIssue);
  }

  /**
   * Will obtain the issue from IssueService and then check whether the responses (aka comments) has been loaded into the application.
   * If they are not loaded, retrieve the comments from github. Else just use the already retrieved comments.
   */
  private initializeIssue() {
    const id = +this.route.snapshot.paramMap.get('issue_id');
    this.issueService.getIssue(id).pipe(flatMap((issue: Issue) => {
        this.issue = issue;
        if (issue.teamResponse === undefined) {
          return this.issueService.getIssueComments(id);
        }
        return of(null);
      }),
      map((issueComments: IssueComment[]) => {
        return this.mapTeamResponseToIssue(issueComments);
      })
    ).subscribe((issue: Issue) => {
      this.isPageLoading = false;
    }, (error) => {
      this.errorHandlingService.handleHttpError(error, () => this.initializeIssue());
    });
  }

  /**
   * On the assumption that:
   *    1st comment is the team's response.
   */
  private mapTeamResponseToIssue(comments: IssueComment[]): Issue {
    if (!comments) {
      return this.issue;
    }

    if (comments.length > 0) {
      this.issue.teamResponse = comments[0];
    } else {
      this.issue.teamResponse = null;
    }
    this.updateIssue(this.issue);
    return this.issue;
  }
}
