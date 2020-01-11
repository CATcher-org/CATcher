/**
 * A model that is used to manage the etags of multiple list of issues' comments paginated by pages.
 * Example of a single list of comments: https://developer.github.com/v3/issues/comments/#list-comments-in-a-repository
 */
export class CommentsEtagManager {
  // A mapping from issue ID to their respective array of etags of the comments in each page. The index in this array
  // represents (page number - 1)
  private commentsEtags: Map<number, string[]>;

  constructor() {
    this.commentsEtags = new Map<number, string[]>();
  }

  get(issueId: number, pageNumber: number): string {
    const commentsArr = this.commentsEtags.get(issueId);
    if (!commentsArr) {
      return '';
    }
    return commentsArr[pageNumber - 1] || '';
  }

  set(issueId: number, pageNumber: number, etag): void {
    if (!this.commentsEtags.get(issueId)) {
      this.commentsEtags.set(issueId, []);
    }
    this.commentsEtags.get(issueId)[pageNumber - 1] = etag;
  }

  clear() {
    this.commentsEtags.clear();
  }
}
