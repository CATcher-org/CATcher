import {Injectable} from '@angular/core';
import {GithubService} from './github.service';
import {UserService} from './user.service';
import {Phase, PhaseService} from './phase.service';
import {UserRole} from '../models/user.model';

const enum PermissionLevel { Phase = 'Phase', User = 'User' }

const PERMISSIONS = {
  /** Phase 1 Permissions **/
  [Phase.phaseBugReporting]: {
    [UserRole.Student]: {
      'isNewIssueCreatable': true,
      'isIssueDeletable': true,
      'isIssueTitleEditable': true,
      'isIssueDescriptionEditable': true,
      'isIssueLabelsEditable': true,
      'isTeamResponseEditable': false,
      'isTutorResponseEditable': false,
    },
    [UserRole.Tutor]: {
      'isNewIssueCreatable': false,
      'isIssueDeletable': false,
      'isIssueTitleEditable': false,
      'isIssueDescriptionEditable': false,
      'isIssueLabelsEditable': false,
      'isTeamResponseEditable': false,
      'isTutorResponseEditable': false,
    },
    [UserRole.Admin]: {
      'isNewIssueCreatable': true,
      'isIssueDeletable': true,
      'isIssueTitleEditable': true,
      'isIssueDescriptionEditable': true,
      'isIssueLabelsEditable': true,
      'isTeamResponseEditable': false,
      'isTutorResponseEditable': false,
    }
  },

  /** Phase 2 Permissions **/
  [Phase.phaseTeamResponse]: {
    [UserRole.Student]: {
      'isNewIssueCreatable': false,
      'isIssueDeletable': false,
      'isIssueTitleEditable': false,
      'isIssueDescriptionEditable': false,
      'isIssueLabelsEditable': true,
      'isTeamResponseEditable': true,
      'isTutorResponseEditable': false,
    },
    [UserRole.Tutor]: {
      'isNewIssueCreatable': false,
      'isIssueDeletable': false,
      'isIssueTitleEditable': false,
      'isIssueDescriptionEditable': false,
      'isIssueLabelsEditable': false,
      'isTeamResponseEditable': false,
      'isTutorResponseEditable': false,
    },
    [UserRole.Admin]: {
      'isNewIssueCreatable': false,
      'isIssueDeletable': false,
      'isIssueTitleEditable': false,
      'isIssueDescriptionEditable': true,
      'isIssueLabelsEditable': true,
      'isTeamResponseEditable': true,
      'isTutorResponseEditable': false,
    }
  },

  [Phase.phaseTesterResponse]: {
    [UserRole.Student]: {
      'isNewIssueCreatable': false,
      'isIssueDeletable': false,
      'isIssueTitleEditable': false,
      'isIssueDescriptionEditable': false,
      'isIssueLabelsEditable': false,
      'isTeamResponseEditable': true,
      'isTutorResponseEditable': false,
    },
    [UserRole.Tutor]: {
      'isNewIssueCreatable': false,
      'isIssueDeletable': false,
      'isIssueTitleEditable': false,
      'isIssueDescriptionEditable': false,
      'isIssueLabelsEditable': false,
      'isTeamResponseEditable': false,
      'isTutorResponseEditable': false,
    },
    [UserRole.Admin]: {
      'isNewIssueCreatable': false,
      'isIssueDeletable': false,
      'isIssueTitleEditable': false,
      'isIssueDescriptionEditable': true,
      'isIssueLabelsEditable': true,
      'isTeamResponseEditable': true,
      'isTutorResponseEditable': false,
    }
  },

  /** Phase 3 Permissions **/
  [Phase.phaseModeration]: {
    [UserRole.Student]: {
      'isNewIssueCreatable': false,
      'isIssueDeletable': false,
      'isIssueTitleEditable': false,
      'isIssueDescriptionEditable': false,
      'isIssueLabelsEditable': false,
      'isTeamResponseEditable': false,
      'isTutorResponseEditable': false,
    },
    [UserRole.Tutor]: {
      'isNewIssueCreatable': false,
      'isIssueDeletable': false,
      'isIssueTitleEditable': false,
      'isIssueDescriptionEditable': true,
      'isIssueLabelsEditable': true,
      'isTeamResponseEditable': false,
      'isTutorResponseEditable': true,
    },
    [UserRole.Admin]: {
      'isNewIssueCreatable': false,
      'isIssueDeletable': false,
      'isIssueTitleEditable': false,
      'isIssueDescriptionEditable': true,
      'isIssueLabelsEditable': true,
      'isTeamResponseEditable': false,
      'isTutorResponseEditable': true,
    }
  }
};

@Injectable({
  providedIn: 'root',
})
export class PermissionService {
  constructor(private githubService: GithubService, private userService: UserService, private phaseService: PhaseService) {}

  isNewIssueCreatable(): boolean {
    return this.askForPermission(PermissionLevel.User, 'isNewIssueCreatable');
  }

  isIssueDeletable(): boolean {
    return this.askForPermission(PermissionLevel.User, 'isIssueDeletable');
  }

  isIssueTitleEditable(): boolean {
    return this.askForPermission(PermissionLevel.User, 'isIssueTitleEditable');
  }

  isIssueDescriptionEditable(): boolean {
    return this.askForPermission(PermissionLevel.User, 'isIssueDescriptionEditable');
  }

  isIssueLabelsEditable(): boolean {
    return this.askForPermission(PermissionLevel.User, 'isIssueLabelsEditable');
  }

  isTeamResponseEditable(): boolean {
    return this.askForPermission(PermissionLevel.User, 'isTeamResponseEditable');
  }

  isTutorResponseEditable(): boolean {
    return this.askForPermission(PermissionLevel.User, 'isTutorResponseEditable');
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
