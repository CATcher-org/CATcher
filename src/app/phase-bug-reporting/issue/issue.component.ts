import { AfterViewChecked, AfterViewInit, Component, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ISSUE_COMPONENTS, ViewIssueComponent } from '../../shared/view-issue/view-issue.component';

@Component({
  selector: 'app-issue',
  templateUrl: './issue.component.html',
  styleUrls: ['./issue.component.css']
})
export class IssueComponent implements AfterViewInit, AfterViewChecked {
  issueId: number;

  readonly issueComponents: ISSUE_COMPONENTS[] = [
    ISSUE_COMPONENTS.TESTER_POST,
    ISSUE_COMPONENTS.SEVERITY_LABEL,
    ISSUE_COMPONENTS.TYPE_LABEL
  ];

  @ViewChild(ViewIssueComponent, { static: false }) viewIssue: ViewIssueComponent;

  constructor(private route: ActivatedRoute) {}

  ngAfterViewInit(): void {
    this.route.params.subscribe((params) => {
      this.issueId = +params['issue_id'];
    });
  }

  ngAfterViewChecked() {
    this.route.params.subscribe((params) => {
      this.issueId = +params['issue_id'];
    });
  }

  canDeactivate(): boolean {
    return !this.viewIssue.isEditing();
  }
}
