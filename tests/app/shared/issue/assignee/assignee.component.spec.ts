import { of } from 'rxjs';

import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { PhaseService } from '../../../../../src/app/core/services/phase.service';
import { User, UserRole } from '../../../../../src/app/core/models/user.model';
import { AssigneeComponent } from '../../../../../src/app/shared/issue/assignee/assignee.component';
import { ErrorHandlingService } from '../../../../../src/app/core/services/error-handling.service';
import { ISSUE_WITH_EMPTY_DESCRIPTION } from '../../../../constants/githubissue.constants';
import { Issue } from '../../../../../src/app/core/models/issue.model';
import { IssueService } from '../../../../../src/app/core/services/issue.service';
import { MaterialModule } from '../../../../../src/app/shared/material.module';
import { PermissionService } from '../../../../../src/app/core/services/permission.service';
import { Team } from '../../../../../src/app/core/models/team.model';
import { UserService } from '../../../../../src/app/core/services/user.service';
import { Phase } from '../../../../../src/app/core/models/phase.model';

describe('AssigneeComponent', () => {
  let component: AssigneeComponent;
  let debugElement: DebugElement;
  let nativeElement: HTMLElement;
  let fixture: ComponentFixture<AssigneeComponent>;
  let dummyIssue: Issue;

  const testStudent: User = {
    loginId: 'testStudent',
    role: UserRole.Student
  };

  const testStudent2: User = {
    loginId: 'testStudent2',
    role: UserRole.Student
  };

  const testStudent3: User = {
    loginId: 'testStudent3',
    role: UserRole.Student
  };

  const testStudent4: User = {
    loginId: 'testStudent4',
    role: UserRole.Student
  };

  const dummyTeam: Team = new Team({
    id: 'F09-2',
    teamMembers: [testStudent, testStudent2, testStudent3, testStudent4]
  });

  const phaseService: any = jasmine.createSpyObj('PhaseService', [], { currentPhase: Phase.phaseTeamResponse });
  const issueService: any = jasmine.createSpyObj('IssueService', ['getLatestIssue', 'updateIssue']);
  const permissionsService: any = jasmine.createSpyObj('PermissionService', ['isIssueLabelsEditable']);

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        AssigneeComponent
      ],
      providers: [
        IssueService, ErrorHandlingService, PhaseService, PermissionService
      ],
      imports: [
        FormsModule, MaterialModule, BrowserAnimationsModule
      ]
    })
    .overrideProvider(IssueService, { useValue: issueService })
    .overrideProvider(PhaseService, { useValue: phaseService })
    .overrideProvider(PermissionService, { useValue: permissionsService })
    .compileComponents();
  }));

  beforeEach(() => {
    permissionsService.isIssueLabelsEditable.and.callFake(() => true);
    fixture = TestBed.createComponent(AssigneeComponent);
    component = fixture.componentInstance;

    dummyIssue =  Issue.createPhaseTeamResponseIssue(ISSUE_WITH_EMPTY_DESCRIPTION, dummyTeam);
    component.team = dummyTeam;
    component.issue = dummyIssue;
    fixture.detectChanges();

    debugElement = fixture.debugElement;
    nativeElement = fixture.nativeElement;
  });

  it('should have a placeholder value of - given no assignees', () => {
    const matPlaceholderValue: HTMLElement = debugElement.query(By.css('p')).nativeElement;
    expect(matPlaceholderValue.innerText).toEqual('-'); // Placeholder Value
  });

  it('should be able to open the assignee selector', () => {
    openMatSelect();
    const matOption: HTMLElement = debugElement.query(By.css('.mat-option')).nativeElement;
    const inputElement: HTMLElement = debugElement.query(By.css('.mat-select-panel')).nativeElement;

    expect(inputElement.children.length).toBe(dummyTeam.teamMembers.length);
    expect(matOption.attributes.getNamedItem('aria-selected').value).toEqual('false');
  });

  it('should emit an event containing the issue with updated assignees, upon closing the MatSelect', () => {
    spyOn(component.issueUpdated, 'emit');
    openMatSelect();
    addAssignee();
    dispatchClosedEvent();

    expect(component.issueUpdated.emit).toHaveBeenCalledWith(jasmine.objectContaining({assignees: [testStudent.loginId]}));
  });

  it('should show the updated assignees upon receiving an updated issue', () => {
    component.issue.assignees = [testStudent.loginId];
    fixture.detectChanges();

    const matListText: HTMLElement = debugElement.query(By.css('.mat-list-item-content')).nativeElement;
    expect(matListText.innerText).toEqual(testStudent.loginId);
  });

  function openMatSelect(): void {
    const matSelectButton: HTMLElement = nativeElement.querySelector('button');
    matSelectButton.click();
    fixture.detectChanges();
  }

  function addAssignee(): void {
    const matOption: HTMLElement = debugElement.query(By.css('.mat-option')).nativeElement;
    matOption.click();
    fixture.detectChanges();
  }

  function dispatchClosedEvent() {
    const matSelectElement: HTMLElement = debugElement.query(By.css('.mat-select')).nativeElement;
    issueService.updateIssue.and.callFake((updatedIssue: Issue) => of(updatedIssue));
    matSelectElement.dispatchEvent(new Event('closed'));
    fixture.detectChanges();
  }
});
