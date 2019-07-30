import { Injectable } from '@angular/core';
import { GithubService } from './github.service';
import { Observable, of } from 'rxjs';
import { map, flatMap } from 'rxjs/operators';
import { IssueService } from './issue.service';

@Injectable({
  providedIn: 'root'
})
export class GithubEventService {

  private lastModified: string; // The timestamp when the title or label of an issue is changed
  private lastModifiedComment: string; // The timestamp when the comment of an issue is changed

  constructor(private githubService: GithubService, private issueService: IssueService) { }

  /**
   * Calls the Github service api to return the latest github event (e.g renaming an issue's title)
   * of current repository and store the timestamps of the event in this service
   */
  setLatestChangeEvent(): Observable<any> {
      return this.githubService.fetchEventsForRepo().pipe(
        map((response) => {
          if (response.length === 0) {
            return response;
          }
          this.setLastModifiedTime(response[0]['created_at']);
          this.setLastModifiedCommentTime(response[0]['issue']['updated_at']);
          return response;
        })
      );
  }

  /**
   * Returns the latest github event (e.g renaming an issue's title) of current repository
   * @returns the json data of the latest event
   */
  reloadPage() {
    return this.githubService.fetchEventsForRepo().pipe(
      flatMap((response: any[]) => {
        if (response.length === 0) {
          return of(response);
        }
        const eventResponse = response[0];
        // Will only allow page to reload if the latest modify time is different
        // from last modified, meaning that some changes to the repo has occured.
        if (eventResponse['created_at'] !== this.getLastModifiedTime() ||
        eventResponse['issue']['updated_at'] !== this.getLastModifiedCommentTime()) {
          this.setLastModifiedTime(eventResponse['created_at']);
          this.setLastModifiedCommentTime(eventResponse['issue']['updated_at']);
          return this.issueService.reloadAllIssues();
        }
        return of(response);
      })
    );
  }

  setLastModifiedTime(lastModified: string) {
    this.lastModified = lastModified;
  }

  setLastModifiedCommentTime(lastModified: string) {
    this.lastModifiedComment = lastModified;
  }

  getLastModifiedTime() {
    return this.lastModified;
  }

  getLastModifiedCommentTime() {
    return this.lastModifiedComment;
  }

  reset() {
    this.lastModified = undefined;
    this.lastModifiedComment = undefined;
  }
}
