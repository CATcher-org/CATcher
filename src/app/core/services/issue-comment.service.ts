import {Injectable} from '@angular/core';
import {Observable, of} from 'rxjs';
import {GithubService} from './github.service';
import {ErrorHandlingService} from './error-handling.service';
import {IssueComment, IssueComments} from '../models/comment.model';
import {map} from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class IssueCommentService {
  comments = new Map<number, IssueComments>();

  constructor(private githubService: GithubService, private errorHandlingService: ErrorHandlingService) {
  }

  getIssueComments(issueId: number): Observable<IssueComments> {
    if (!this.comments.get(issueId)) {
      return this.initializeIssueComments(issueId);
    } else {
      return of(this.comments.get(issueId));
    }
  }

  createIssueComment(issueId: number, description: string) {
    return this.githubService.createIssueComment(issueId, description);
  }

  updateIssueComment(issueComment: IssueComment): Observable<IssueComment> {
    return this.githubService.updateIssueComment(issueComment);
  }

  private initializeIssueComments(issueId: number): Observable<IssueComments> {
    return this.githubService.fetchIssueComments(issueId).pipe(map((comments: IssueComment[]) => {
      const newIssueComments = {};
      if (comments.length > 0) {
        newIssueComments['teamResponse'] = comments[0];
      }
      if (comments.length > 1) {
        newIssueComments['testerObjection'] = comments[1];
      }
      if (comments.length > 2) {
        newIssueComments['tutorResponse'] = comments[2];
      }
      this.comments.set(issueId, <IssueComments>{...newIssueComments, issueId: issueId});
      return this.comments.get(issueId);
    }));
  }

  /**
   * To add/update an issue.
   */
  updateLocalStore(commentsToUpdate: IssueComments) {
    this.comments.set(commentsToUpdate.issueId, commentsToUpdate);
  }

  reset() {
    this.comments.clear();
  }
}
