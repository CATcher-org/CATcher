/**
 * A model that is used to manage the etags of multiple list of issues paginated by pages.
 * Example of a single list of issues: https://developer.github.com/v3/issues/#list-issues-for-a-repository
 */
export class IssuesEtagManager {
  // An array of etags with each etag representing an single page of issues on Github. The index this array represents (page number - 1)
  private issuesEtags: string[];

  constructor() {
    this.issuesEtags = [];
  }

  get(pageNumber: number): string {
    return this.issuesEtags[pageNumber - 1] || '';
  }

  set(pageNumber: number, etag: string): void {
    this.issuesEtags[pageNumber - 1] = etag;
  }

  clear(): void {
    this.issuesEtags = [];
  }
}
