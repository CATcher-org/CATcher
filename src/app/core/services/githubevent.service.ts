import { Injectable } from '@angular/core';
import { GithubService } from './github.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class GithubEventService {

  private lastModified: string; // The timestamp when the title or label of an issue is changed
  private lastModifiedComment: string; // The timestamp when the comment of an issue is changed

  constructor(private githubService: GithubService) { }

  /**
   * Calls the Github service api to return the latest github event (e.g renaming an issue's title)
   * of current repository and store the timestamps of the event in this service
   */
  setLatestChangeEvent(userResponse: User): Observable<User> {
      return this.githubService.fetchEventsForRepo().pipe(
        map((response) => {
          this.setLastModifiedTime(response[0]['created_at']);
          this.setLastModifiedCommentTime(response[0]['issue']['updated_at']);
          return userResponse;
        })
      );
  }

  /**
   * Returns the latest github event (e.g renaming an issue's title) of current repository
   * @returns the json data of the latest event
   */
  getLatestChangeEvent(): Observable<any> {
    return this.githubService.fetchEventsForRepo().pipe(
      map((response) => {
        return response[0];
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
