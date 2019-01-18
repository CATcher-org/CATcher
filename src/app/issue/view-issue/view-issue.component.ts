import {Component, OnInit} from '@angular/core';
import {GithubService} from '../../core/services/github.service';
import {ActivatedRoute} from '@angular/router';
import {first} from 'rxjs/operators';
import {Issue} from '../../core/models/issue.model';
import {IssueService} from '../../core/services/issue.service';

@Component({
  selector: 'app-view-issue',
  templateUrl: './view-issue.component.html',
  styleUrls: ['./view-issue.component.css']
})
export class ViewIssueComponent implements OnInit {
  isPageLoading = true;
  issue: Issue;

  constructor(private issueService: IssueService, private githubService: GithubService, private route: ActivatedRoute) { }

  ngOnInit() {
    const id = +this.route.snapshot.paramMap.get('issue_id');
    this.issueService.getIssue(id).subscribe((issue) => {
      this.issue = issue;
      this.isPageLoading = false;
    });
  }
}
