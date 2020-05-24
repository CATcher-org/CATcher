/**
 * A model that is used to manage the etags of multiple list of issues' comments paginated by pages.
 * Example of a single list of comments: https://developer.github.com/v3/issues/comments/#list-comments-in-a-repository
 */
import { GithubComment } from '../github-comment.model';
import { GithubResponse } from '../github-response.model';

export class CommentsCacheManager {
  // A mapping from issue ID to their respective array of etags of the comments in each page. The index in this array
  // represents (page number - 1)
  private commentsEtags: Map<number, string[]>;
  // A mapping from issue ID to their respective github responses of the comments in each page. The index in this array
  // represents (page number - 1)
  private commentsCache: Map<number, GithubResponse<GithubComment[]>[]>;

  constructor() {
    this.commentsEtags = new Map<number, string[]>();
    this.commentsCache = new Map<number, GithubResponse<GithubComment[]>[]>();
  }

  getEtagFor(issueId: number, pageNumber: number): string {
    const comments = this.commentsCache.get(issueId);
    if (!comments || !comments[pageNumber - 1]) {
      return '';
    } else {
      return comments[pageNumber - 1].headers.etag || '';
    }
  }

  get(issueId: number, pageNumber: number): GithubResponse<GithubComment[]> {
    const comments = this.commentsCache.get(issueId);
    if (!comments) {
      return undefined;
    } else {
      return comments[pageNumber - 1];
    }
  }

  set(issueId: number, pageNumber: number, comment: GithubResponse<GithubComment[]>) {
    comment.isCached = true;
    const comments = this.commentsCache.get(issueId);
    if (!comments) {
      this.commentsCache.set(issueId, []);
    }
    this.commentsCache.get(issueId)[pageNumber - 1] = comment;
  }

  clear() {
    this.commentsCache.clear();
  }
}
