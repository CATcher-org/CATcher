import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { flatMap, map, retry, tap } from 'rxjs/operators';
import { Observable, of, pipe, UnaryFunction } from 'rxjs';
import { GithubService } from './github.service';
import { LabelService } from './label.service';
import { UserService } from './user.service';
import { UserRole } from '../models/user.model';
import { SessionData, assertSessionDataIntegrity } from '../models/session.model';
import { MatDialog } from '@angular/material';
import { SessionFixConfirmationComponent } from './session-fix-confirmation/session-fix-confirmation.component';
import { Phase } from '../models/phase.model';
import { throwIfFalse } from '../../shared/lib/custom-ops';

export const SESSION_AVALIABILITY_FIX_FAILED = 'Session Availability Fix failed.';

@Injectable({
  providedIn: 'root',
})
export class RepositoryService {
  constructor(
    private githubService: GithubService,
    private labelService: LabelService,
    private userService: UserService
  ) {}
}
