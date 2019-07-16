import {Injectable} from '@angular/core';
import {GithubService} from './github.service';
import {UserService} from './user.service';
import {Phase, PhaseService} from './phase.service';
import {UserRole} from '../models/user.model';

const enum PermissionLevel { Phase = 'Phase', User = 'User' }

const PERMISSIONS = {
  /** Phase 1 Permissions **/
  [Phase.phase1]: {
    [UserRole.Student]: {
      'canCreateNewIssue': true,
      'canDeleteIssue': true,
      'canEditIssueTitle': true,
      'canEditIssueDescription': true,
      'canEditIssueLabels': true,
      'canCRUDTeamResponse': false,
      'canCRUDTutorResponse': false,
    },
    [UserRole.Tutor]: {
      'canCreateNewIssue': false,
      'canDeleteIssue': false,
      'canEditIssueTitle': false,
      'canEditIssueDescription': false,
      'canEditIssueLabels': false,
      'canCRUDTeamResponse': false,
      'canCRUDTutorResponse': false,
    },
    [UserRole.Admin]: {
      'canCreateNewIssue': true,
      'canDeleteIssue': true,
      'canEditIssueTitle': true,
      'canEditIssueDescription': true,
      'canEditIssueLabels': true,
      'canCRUDTeamResponse': false,
      'canCRUDTutorResponse': false,
    }
  },

  /** Phase 2 Permissions **/
  [Phase.phase2]: {
    [UserRole.Student]: {
      'canCreateNewIssue': false,
      'canDeleteIssue': false,
      'canEditIssueTitle': false,
      'canEditIssueDescription': false,
      'canEditIssueLabels': true,
      'canCRUDTeamResponse': true,
      'canCRUDTutorResponse': false,
    },
    [UserRole.Tutor]: {
      'canCreateNewIssue': false,
      'canDeleteIssue': false,
      'canEditIssueTitle': false,
      'canEditIssueDescription': false,
      'canEditIssueLabels': false,
      'canCRUDTeamResponse': false,
      'canCRUDTutorResponse': false,
    },
    [UserRole.Admin]: {
      'canCreateNewIssue': false,
      'canDeleteIssue': false,
      'canEditIssueTitle': false,
      'canEditIssueDescription': true,
      'canEditIssueLabels': true,
      'canCRUDTeamResponse': true,
      'canCRUDTutorResponse': false,
    }
  },

  [Phase.phaseTesterResponse]: {
    [UserRole.Student]: {
      'canCreateNewIssue': false,
      'canDeleteIssue': false,
      'canEditIssueTitle': false,
      'canEditIssueDescription': false,
      'canEditIssueLabels': false,
      'canCRUDTeamResponse': true,
      'canCRUDTutorResponse': false,
    },
    [UserRole.Tutor]: {
      'canCreateNewIssue': false,
      'canDeleteIssue': false,
      'canEditIssueTitle': false,
      'canEditIssueDescription': false,
      'canEditIssueLabels': false,
      'canCRUDTeamResponse': false,
      'canCRUDTutorResponse': false,
    },
    [UserRole.Admin]: {
      'canCreateNewIssue': true,
      'canDeleteIssue': true,
      'canEditIssueTitle': true,
      'canEditIssueDescription': true,
      'canEditIssueLabels': true,
      'canCRUDTeamResponse': false,
      'canCRUDTutorResponse': false,
    }
  },

  /** Phase 3 Permissions **/
  [Phase.phase3]: {
    [UserRole.Student]: {
      'canCreateNewIssue': false,
      'canDeleteIssue': false,
      'canEditIssueTitle': false,
      'canEditIssueDescription': false,
      'canEditIssueLabels': false,
      'canCRUDTeamResponse': false,
      'canCRUDTutorResponse': false,
    },
    [UserRole.Tutor]: {
      'canCreateNewIssue': false,
      'canDeleteIssue': false,
      'canEditIssueTitle': false,
      'canEditIssueDescription': true,
      'canEditIssueLabels': true,
      'canCRUDTeamResponse': false,
      'canCRUDTutorResponse': true,
    },
    [UserRole.Admin]: {
      'canCreateNewIssue': false,
      'canDeleteIssue': false,
      'canEditIssueTitle': false,
      'canEditIssueDescription': true,
      'canEditIssueLabels': true,
      'canCRUDTeamResponse': false,
      'canCRUDTutorResponse': true,
    }
  }
};

@Injectable({
  providedIn: 'root',
})
export class PermissionService {
  constructor(private githubService: GithubService, private userService: UserService, private phaseService: PhaseService) {}

  canCreateNewIssue(): boolean {
    return this.askForPermission(PermissionLevel.User, 'canCreateNewIssue');
  }

  canDeleteIssue(): boolean {
    return this.askForPermission(PermissionLevel.User, 'canDeleteIssue');
  }

  canEditIssueTitle(): boolean {
    return this.askForPermission(PermissionLevel.User, 'canEditIssueTitle');
  }

  canEditIssueDescription(): boolean {
    return this.askForPermission(PermissionLevel.User, 'canEditIssueDescription');
  }

  canEditIssueLabels(): boolean {
    return this.askForPermission(PermissionLevel.User, 'canEditIssueLabels');
  }

  canCRUDTeamResponse(): boolean {
    return this.askForPermission(PermissionLevel.User, 'canCRUDTeamResponse');
  }

  canCRUDTutorResponse(): boolean {
    return this.askForPermission(PermissionLevel.User, 'canCRUDTutorResponse');
  }

  private askForPermission(permissionLevel: PermissionLevel, permissionType: string): boolean {
    switch (permissionLevel) {
      case PermissionLevel.Phase:
        return PERMISSIONS[this.phaseService.currentPhase][permissionType];
      case PermissionLevel.User:
        return PERMISSIONS[this.phaseService.currentPhase][this.userService.currentUser.role][permissionType];
      default:
        return false;
    }
  }
}
