import { Injectable } from '@angular/core';
import { GithubService } from './github.service';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root',
})
export class RepoCreatorService {
  constructor(
    private githubService: GithubService,
    private userService: UserService
  ) {}
}
