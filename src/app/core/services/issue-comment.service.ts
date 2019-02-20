import {Injectable} from '@angular/core';
import {Observable, of} from 'rxjs';
import {GithubService} from './github.service';
import {ErrorHandlingService} from './error-handling.service';
import {IssueComment, IssueComments} from '../models/comment.model';
import {map} from 'rxjs/operators';
import {Issue} from '../models/issue.model';

@Injectable({
  providedIn: 'root',
})
export class IssueCommentService {
  comments = new Map<number, IssueComments>();

  constructor(private githubService: GithubService) {
  }

  getIssueComments(issueId: number): Observable<IssueComments> {
    if (!this.comments.get(issueId)) {
      return this.initializeIssueComments(issueId);
    } else {
      return of(this.comments.get(issueId));
    }
  }

  createIssueComment(issueId: number, description: string, duplicatedOf: Issue) {
    return this.githubService.createIssueComment(issueId, description, duplicatedOf);
  }

  updateIssueComment(issueComment: IssueComment): Observable<IssueComment> {
    return this.githubService.updateIssueComment(issueComment);
  }

  updateWithDuplicateOfValue(issueId: number, duplicateOfNumber: number): Observable<IssueComment> {
    const issueComment = this.comments.get(issueId).teamResponse;
    const regex = /(duplicate of\s*#)(\d+)/i;
    const duplicateOfArray = regex.exec(issueComment.description);
    let updatedDescription = issueComment.description;

    if (duplicateOfArray && duplicateOfArray.length >= 2) { // search and replace existing duplicateOf string
      updatedDescription = updatedDescription.replace(/(duplicate of\s*#)(\d+)/i, `$1${duplicateOfNumber}`);
    } else { // Add duplicateOf value into comment
      updatedDescription = `Duplicate of #${duplicateOfNumber}\n` + updatedDescription;
    }
    return this.githubService.updateIssueComment({
      ...issueComment,
      description: updatedDescription,
    });
  }

  removeDuplicateOfValue(issueId: number): Observable<IssueComment> {
    const issueComment = this.comments.get(issueId).teamResponse;
    const regex = /(duplicate of\s*#)(\d+)/i;
    const duplicateOfArray = regex.exec(issueComment.description);
    let updatedDescription = issueComment.description;

    if (duplicateOfArray && duplicateOfArray.length >= 2) { // search and replace existing duplicateOf string
      updatedDescription = updatedDescription.replace(/(duplicate of\s*#)(\d+)/i, '');
    }
    return this.githubService.updateIssueComment({
      ...issueComment,
      description: updatedDescription,
    });
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
