import { FormBuilder, NgForm } from '@angular/forms';
import { MatDialogRef } from '@angular/material';
import { of } from 'rxjs';
import { UserConfirmationComponent } from '../../../../../src/app/core/guards/user-confirmation/user-confirmation.component';
import { Issue } from '../../../../../src/app/core/models/issue.model';
import { Phase } from '../../../../../src/app/core/models/phase.model';
import { DialogService } from '../../../../../src/app/core/services/dialog.service';
import { PhaseService } from '../../../../../src/app/core/services/phase.service';
import { TitleComponent } from '../../../../../src/app/shared/issue/title/title.component';
import { ISSUE_WITH_EMPTY_DESCRIPTION } from '../../../../constants/githubissue.constants';

describe('TitleComponent', () => {
  let titleComponent: TitleComponent;
  let issueService: any;
  let thisIssue: Issue;
  let formBuilder: any;
  let phaseService: PhaseService;
  let dialogService: jasmine.SpyObj<DialogService>;

  beforeEach(() => {
    formBuilder = new FormBuilder();
    phaseService = new PhaseService(null, null, null);
    phaseService.currentPhase = Phase.phaseTeamResponse;

    issueService = jasmine.createSpyObj('IssueService', ['updateIssue']);
    dialogService = jasmine.createSpyObj('DialogService', ['openUserConfirmationModal']);
    titleComponent = new TitleComponent(issueService, formBuilder, null, null, phaseService, dialogService);
    thisIssue = Issue.createPhaseBugReportingIssue(ISSUE_WITH_EMPTY_DESCRIPTION);
    titleComponent.issue = thisIssue;
  });

  it('should be initialised with an issueTitleForm', () => {
    titleComponent.ngOnInit();
    expect(titleComponent.issueTitleForm.value).toEqual({ title: '' });
  });

  it('should be updated with correct flags and values in editing mode', () => {
    titleComponent.ngOnInit();
    titleComponent.changeToEditMode();
    expect(titleComponent.isEditing).toEqual(true);
    expect(titleComponent.issueTitleForm.value).toEqual({ title: thisIssue.title });
  });

  it('should not have its value updated with issue title is invalid', () => {
    thisIssue.title = undefined;
    titleComponent.issue = thisIssue;
    titleComponent.ngOnInit();
    titleComponent.changeToEditMode();
    expect(titleComponent.isEditing).toEqual(true);
    expect(titleComponent.issueTitleForm.value).toEqual({ title: '' });
  });

  it('should be configured correctly when title is updated', () => {
    const form = new NgForm([], []);
    const formResetForm = spyOn(form, 'resetForm');
    const titleComponentEmitter = spyOn(titleComponent.issueUpdated, 'emit');

    titleComponent.ngOnInit();
    titleComponent.changeToEditMode();

    issueService.updateIssue.and.callFake((x: Issue) => of(x));
    titleComponent.updateTitle(form);

    expect(formResetForm).toHaveBeenCalledTimes(1);
    expect(titleComponentEmitter).toHaveBeenCalledTimes(1);
    expect(titleComponent.isEditing).toEqual(false);
  });

  it('should cancel edit mode only if confirmed in confirmation dialog', () => {
    titleComponent.ngOnInit();
    titleComponent.changeToEditMode();

    dialogService.openUserConfirmationModal.and.returnValue({ afterClosed: () => of(false) } as MatDialogRef<UserConfirmationComponent>);
    titleComponent.openCancelDialog();
    expect(titleComponent.isEditing).toEqual(true);

    dialogService.openUserConfirmationModal.and.returnValue({ afterClosed: () => of(true) } as MatDialogRef<UserConfirmationComponent>);
    titleComponent.openCancelDialog();
    expect(titleComponent.isEditing).toEqual(false);
  });
});
