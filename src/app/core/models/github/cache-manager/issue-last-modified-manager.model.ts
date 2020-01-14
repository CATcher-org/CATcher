/**
 * A model that is used to manage the last modified timing of individual issues.
 * Example of a single issue: https://developer.github.com/v3/issues/#get-a-single-issue
 */
export class IssueLastModifiedManagerModel {
  // A mapping from issue ID to their respective last modified timing
  private issueLastModified: Map<number, string>;

  constructor() {
    this.issueLastModified = new Map<number, string>();
  }

  get(issueId: number): string {
    return this.issueLastModified.get(issueId) || '';
  }

  set(issueId: number, etag: string): void {
    this.issueLastModified.set(issueId, etag);
  }

  clear() {
    this.issueLastModified.clear();
  }
}
