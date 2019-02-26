import {Injectable} from '@angular/core';
import {Observable, of} from 'rxjs';
import {GithubService} from './github.service';
import {IssueComment, IssueComments, phase2ResponseTemplate} from '../models/comment.model';
import {map} from 'rxjs/operators';
import {Issue} from '../models/issue.model';
import {Phase, PhaseService} from './phase.service';

@Injectable({
  providedIn: 'root',
})
export class IssueCommentService {
  comments = new Map<number, IssueComments>();

  constructor(private githubService: GithubService, private phaseService: PhaseService) {
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

    return this.githubService.updateIssueComment({
      ...issueComment,
      description: this.createGithubResponse(issueComment.description, `Duplicate of #${duplicateOfNumber}`),
    }).pipe(
      map((comment: IssueComment) => {
        return this.parseResponse(comment);
      })
    );
  }

  removeDuplicateOfValue(issueId: number): Observable<IssueComment> {
    const issueComment = this.comments.get(issueId).teamResponse;

    return this.githubService.updateIssueComment({
      ...issueComment,
      description: this.createGithubResponse(issueComment.description, 'Not a duplicated issue.'),
    }).pipe(
      map((comment: IssueComment) => {
        return this.parseResponse(comment);
      })
    );
  }

  private initializeIssueComments(issueId: number): Observable<IssueComments> {
    return this.githubService.fetchIssueComments(issueId).pipe(map((comments: IssueComment[]) => {
      const newIssueComments = {};

      if (comments.length > 0) {
        switch (this.phaseService.currentPhase) {
          case Phase.phase2:
            newIssueComments['teamResponse'] = this.parseResponse(comments[0]);
            break;
          case Phase.phase3:
            // TODO: Ronak
            break;
          default:
            break;
        }
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

  private parseResponse(comment: IssueComment): IssueComment {
    const toParse = comment.description;

    switch (this.phaseService.currentPhase) {
      case Phase.phase2:
        if (!phase2ResponseTemplate.test(toParse)) {
          return comment;
        }

        const matches = toParse.match(phase2ResponseTemplate);
        const response = comment;
        for (const match of matches) {
          const groups = phase2ResponseTemplate.exec(match)['groups'];
          switch (groups['header']) {
            case '## Team\'s Response':
              if (groups['description'].trim() === 'Write your response here.') {
                return null;
              }
              response.description = groups['description'];
              break;
            case '## State the duplicated issue here, if any':
              response.duplicateOf = this.parseDuplicateOfValue(groups['description']);
              break;
            default:
              return null;
          }
          // reset regex because of Javascript's behaviour of retaining regex's state that has 'global' flag.
          phase2ResponseTemplate.lastIndex = 0;
        }
        return response;
      case Phase.phase3:
        // TODO: Ronak
      default:
        return null;
    }
  }

  private parseDuplicateOfValue(toParse: string): number {
    const regex = /duplicate of\s*#(\d+)/i;
    const result = regex.exec(toParse);
    if (result && result.length >= 2) {
      return +regex.exec(toParse)[1];
    } else {
      return null;
    }
  }

  private createGithubResponse(description: string, duplicateOf: string) {
    switch (this.phaseService.currentPhase) {
      case Phase.phase2:
        return `## Team\'s Response\n${description}\n## State the duplicated issue here, if any\n${duplicateOf}`;
      case Phase.phase3:
        // TODO: Ronak
    }
  }
}
