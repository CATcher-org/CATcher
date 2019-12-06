import {Injectable} from '@angular/core';
import {Observable, of} from 'rxjs';
import {GithubService} from './github.service';
import {IssueComment, IssueComments} from '../models/comment.model';
import {map} from 'rxjs/operators';
import * as moment from 'moment';
import { TesterResponse } from '../models/tester-response.model';
import { IssueDispute } from '../models/issue-dispute.model';
import { GithubComment } from '../models/github-comment.model';

@Injectable({
  providedIn: 'root',
})
export class IssueCommentService {
  // A map from issueId to their respective issue comments.
  comments = new Map<number, IssueComments>();

  constructor(private githubService: GithubService) {
  }

  getIssueComments(issueId: number, isIssueReloaded: boolean): Observable<IssueComments> {
    if (!this.comments.get(issueId) || isIssueReloaded) {
      return this.initializeIssueComments(issueId);
    }
    return of(this.comments.get(issueId));
  }

  getGithubComments(issueId: number): Observable<GithubComment[]> {
    this.initializeIssueComments(issueId).subscribe();
    return this.githubService.fetchIssueComments(issueId).pipe(
      map(rawJsonDataArray => rawJsonDataArray.map(rawJsonData => <GithubComment> {
        ...rawJsonData
      }))
    );
  }

  createIssueComment(issueId: number, description: string): Observable<IssueComment> {
    return this.githubService.createIssueComment(issueId, description).pipe(
      map((response) => {
        return this.createIssueCommentModel(response);
      })
    );
  }

  updateIssueComment(issueComment: IssueComment): Observable<IssueComment> {
    return this.githubService.updateIssueComment({
      ...issueComment,
      description: issueComment.description,
    }).pipe(
      map((response: GithubComment) => {
        return this.createIssueCommentModel(response);
      })
    );
  }

  // Template url: https://github.com/CATcher-org/templates#teams-response-1
  createGithubTesterResponse(teamResponse: string, testerResponses: TesterResponse[]): string {
    return `# Team\'s Response\n${teamResponse}\n ` +
          `# Items for the Tester to Verify\n${this.getTesterResponsesString(testerResponses)}`;
  }

  // Template url: https://github.com/CATcher-org/templates#dev-response-phase
  createGithubTeamResponse(teamResponse: string, duplicateOf: number): string {
      return `# Team\'s Response\n${teamResponse}\n ` +
        `## Duplicate status (if any):\n${duplicateOf ? `Duplicate of #${duplicateOf}` : `--`}`;
  }

  // Template url: https://github.com/CATcher-org/templates#tutor-moderation
  createGithubTutorResponse(issueDisputes: IssueDispute[]): string {
    let tutorResponseString = '# Tutor Moderation\n\n';
    for (const issueDispute of issueDisputes) {
      tutorResponseString += issueDispute.toTutorResponseString();
    }
    return tutorResponseString;
  }

  private getTesterResponsesString(testerResponses: TesterResponse[]): string {
    let testerResponsesString = '';
    for (const testerResponse of testerResponses) {
      testerResponsesString += testerResponse.toString();
    }
    return testerResponsesString;
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

  /**
   * To add/update an issue.
   */
  updateLocalStore(commentToUpdate: IssueComment, issueId: number) {
    const issueComments = this.comments.get(issueId);
    for (const i in issueComments.comments) {
      if (issueComments.comments[i].id === commentToUpdate.id) {
        issueComments.comments[i] = commentToUpdate;
        break;
      }
    }
    this.comments.set(issueId, issueComments);
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
