import { GithubResponse } from '../github-response.model';
import { GithubRestIssue } from '../github-rest-issue';

/**
 * A model that is used to manage the cache of multiple list of issues paginated by pages.
 * Example of a single list of issues: https://docs.github.com/en/rest/issues/issues#list-repository-issues
 */
export class IssuesCacheManager {
  // An array of cache github responses containing the array of GithubIssue as its data
  // The index in this array represents (page number - 1)
  private issuesCache: GithubResponse<GithubRestIssue[]>[];

  constructor() {
    this.issuesCache = [];
  }

  getEtagFor(pageNumber: number): string {
    const cachedResponse = this.get(pageNumber);
    let latestEtag = '';
    if (cachedResponse !== undefined) {
      latestEtag = cachedResponse.headers.etag;
    }
    return latestEtag;
  }

  get(pageNumber: number): GithubResponse<GithubRestIssue[]> {
    return this.issuesCache[pageNumber - 1];
  }

  set(pageNumber: number, response: GithubResponse<GithubRestIssue[]>): void {
    response.isCached = true;
    this.issuesCache[pageNumber - 1] = response;
  }

  clear(): void {
    this.issuesCache = [];
  }
}
