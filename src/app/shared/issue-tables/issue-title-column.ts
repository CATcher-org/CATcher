import { Issue, ISSUE_TYPE_ORDER, SEVERITY_ORDER } from '../../core/models/issue.model';

export function getTitleColumnHTML(issue: Issue): string {
  return `${issue.title} <span style="color: #a3aab1">#${issue.id}</span>`;
}

export function getTitleColumnContent(issue: Issue): string {
  return issue.title + ' #' + issue.id;
}
