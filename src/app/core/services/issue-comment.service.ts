import {Injectable} from '@angular/core';
import { Observable, of } from 'rxjs';
import {GithubService} from './github.service';
import {IssueComment} from '../models/comment.model';
import { catchError, map } from 'rxjs/operators';
import * as moment from 'moment';
import { GithubComment } from '../models/github/github-comment.model';

@Injectable({
  providedIn: 'root',
})
export class IssueCommentService {
  // A map from issueId to their respective issue comments.
  comments = new Map<number, Array<GithubComment>>();

  constructor(private githubService: GithubService) {}

  getGithubComments(issueId: number): Observable<GithubComment[]> {
    return this.githubService.fetchIssueComments(issueId).pipe(
      map((githubComments: Array<GithubComment>) => {
        this.updateLocalIssueComments(issueId, githubComments);
        return githubComments.map(rawJsonData => <GithubComment>{...rawJsonData});
      }),
      catchError(err => {
        return of(this.comments.get(issueId));
      })
    );
  }

  createIssueComment(issueId: number, description: string): Observable<IssueComment> {
    return this.githubService.createIssueComment(issueId, description).pipe(
      map((githubComment: GithubComment) => {
        this.comments.get(issueId).push(githubComment);
        return this.createIssueCommentModel(githubComment);
      })
    );
  }

  updateIssueComment(issueId: number, issueComment: IssueComment): Observable<IssueComment> {
    return this.githubService.updateIssueComment({
      ...issueComment,
      description: issueComment.description,
    }).pipe(
      map((githubComment: GithubComment) => {
        this.updateLocalSingleComment(issueId, githubComment);
        return this.createIssueCommentModel(githubComment);
      })
    );
  }

  /**
   * Updates a single comment for a particular issue.
   */
  updateLocalSingleComment(issueId: number, commentToUpdate: GithubComment) {
    const issueComments = this.comments.get(issueId);
    for (const i in issueComments) {
      if (issueComments[i].id === commentToUpdate.id) {
        issueComments[i] = commentToUpdate;
        break;
      }
    }
    this.comments.set(issueId, issueComments);
  }

  /**
   * Updates all the comments belonging to the issue.
   */
  updateLocalIssueComments(issueId: number, comments: GithubComment[]) {
    this.comments.set(issueId, comments);
  }

  reset() {
    this.comments.clear();
  }

  private createIssueCommentModel(issueCommentInJson: {}): IssueComment {
    return <IssueComment>{
      id: issueCommentInJson['id'],
      createdAt: moment(issueCommentInJson['created_at']).format('lll'),
      updatedAt: moment(issueCommentInJson['updated_at']).format('lll'),
      description: issueCommentInJson['body'],
    };
  }
}
