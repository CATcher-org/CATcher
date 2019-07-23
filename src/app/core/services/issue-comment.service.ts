import {Injectable} from '@angular/core';
import {Observable, of} from 'rxjs';
import {GithubService} from './github.service';
import {IssueComment, IssueComments} from '../models/comment.model';
import {map} from 'rxjs/operators';
import * as moment from 'moment';
import { TesterResponse } from '../models/tester-response.model';

@Injectable({
  providedIn: 'root',
})
export class IssueCommentService {
  // A map from issueId to their respective issue comments.
  comments = new Map<number, IssueComments>();
  readonly MINIMUM_MATCHES = 1;

  constructor(private githubService: GithubService) {
  }

  getIssueComments(issueId: number): Observable<IssueComments> {
    if (!this.comments.get(issueId)) {
      return this.initializeIssueComments(issueId);
    } else {
      return of(this.comments.get(issueId));
    }
  }

  createIssueComment(issueId: number, description: string): Observable<IssueComment> {
    return this.githubService.createIssueComment(<IssueComment>{
      id: issueId,
      description: description,
    }).pipe(
      map((response) => {
        return this.createIssueCommentModel(response);
      })
    );
  }

  private updateIssueComment(issueComment: IssueComment): Observable<IssueComment> {
    return this.githubService.updateIssueComment({
      ...issueComment,
      description: issueComment.description,
    }).pipe(
      map((response) => {
        return this.createIssueCommentModel(response);
      })
    );
  }

  private initializeIssueComments(issueId: number): Observable<IssueComments> {
    return this.githubService.fetchIssueComments(issueId).pipe(
      map((comments: []) => {
        const issueComments = <IssueComments>{
          issueId: issueId,
          comments: [],
        };
        for (const comment of comments) {
          issueComments.comments.push(this.createIssueCommentModel(comment));
        }
        this.comments.set(issueId, <IssueComments>{...issueComments, issueId: issueId});
        return this.comments.get(issueId);
      })
    );
  }

  parseTesterResponse(toParse: string): TesterResponse[] {
    let matches;
    const testerResponses: TesterResponse[] = [];
    const regex = /(## \d.*)[\r\n]*(.*)[\r\n]*(.*)[\r\n]*\*\*Reason for disagreement:\*\* ([\s\S]*?(?=-------------------))/gi;
    while (matches = regex.exec(toParse)) {
      if (matches && matches.length > this.MINIMUM_MATCHES) {
        const [regexString, title, description, disagreeCheckbox, reasonForDiagreement] = matches;
        testerResponses.push(new TesterResponse(title, description, disagreeCheckbox, reasonForDiagreement));
      }
    }
    return testerResponses;
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

  private createIssueCommentModel(issueCommentInJson: {}): IssueComment {
    return <IssueComment>{
      id: issueCommentInJson['id'],
      createdAt: moment(issueCommentInJson['created_at']).format('lll'),
      updatedAt: moment(issueCommentInJson['updated_at']).format('lll'),
      description: issueCommentInJson['body'],
    };
  }
}
