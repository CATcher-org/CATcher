import { TestBed, async, ComponentFixture } from '@angular/core/testing';
import { MaterialModule } from '../../../../../src/app/shared/material.module';

import { AssigneeComponent } from '../../../../../src/app/shared/issue/assignee/assignee.component';
import { ISSUE_WITH_EMPTY_DESCRIPTION } from '../../../../constants/githubissue.constants';
import { Issue } from '../../../../../src/app/core/models/issue.model';
import { of } from 'rxjs';
import { Phase, PhaseService } from '../../../../../src/app/core/services/phase.service';
import { Team } from '../../../../../src/app/core/models/team.model';
import { User, UserRole } from '../../../../../src/app/core/models/user.model';
import { FormsModule } from '@angular/forms';
import { IssueService } from '../../../../../src/app/core/services/issue.service';
import { ErrorHandlingService } from '../../../../../src/app/core/services/error-handling.service';
import { PermissionService } from '../../../../../src/app/core/services/permission.service';
import {
  ApolloTestingModule,
} from 'apollo-angular/testing';
import { HttpClientModule } from '@angular/common/http';
import { UserService } from '../../../../../src/app/core/services/user.service';

describe('AssigneeComponent', () => {
  let component: AssigneeComponent;
  let fixture: ComponentFixture<AssigneeComponent>;

  const testStudent: User = {
      loginId: 'testStudent',
      role: UserRole.Student
  };

  const dummyTeam = new Team({
      id: 'F09-2',
      teamMembers: [ testStudent ],
  });
  const dummyIssue: Issue =  Issue.createPhaseTeamResponseIssue(ISSUE_WITH_EMPTY_DESCRIPTION, dummyTeam);

  const phaseService: PhaseService = new PhaseService(null, null, null, null, null);
  phaseService.currentPhase = Phase.phaseTeamResponse;
  const issueService: IssueService = new IssueService(null, null, phaseService, null, null, null);
  const userService: UserService = new UserService(null, null);
  userService.currentUser = testStudent;
  const permissionsService: PermissionService = new PermissionService(null, userService, phaseService);

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        AssigneeComponent
      ], 
      providers: [
        UserService, IssueService, ErrorHandlingService, PhaseService, PermissionService
      ],
      imports: [
        FormsModule, MaterialModule, ApolloTestingModule, HttpClientModule
      ]
    })
    .overrideProvider(PhaseService, { useValue: phaseService })
    .overrideProvider(IssueService, { useValue: issueService })
    .overrideProvider(UserService, { useValue: userService })
    .overrideProvider(PermissionService, { useValue: permissionsService })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssigneeComponent);
    component = fixture.componentInstance;
    component.team = dummyTeam;
    component.issue = dummyIssue;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

});
