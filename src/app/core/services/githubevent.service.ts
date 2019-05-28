import { Injectable } from '@angular/core';
import { GithubService } from './github.service';
import { ErrorHandlingService } from './error-handling.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class GithubEventService {

  private lastModified: string; // The timestamp when the title or label of an issue is changed
  private lastModifiedComment: string; // The timestamp when the comment of an issue is changed

  constructor(private githubService: GithubService, private errorHandlingService: ErrorHandlingService) { }

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
