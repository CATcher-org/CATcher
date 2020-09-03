import { TitleComponent } from '../../../../../src/app/shared/issue/title/title.component';
import { LabelService } from '../../../../../src/app/core/services/label.service';
import { PermissionService } from '../../../../../src/app/core/services/permission.service';
import { ISSUE_WITH_EMPTY_DESCRIPTION } from '../../../../constants/githubissue.constants';
import { Issue } from '../../../../../src/app/core/models/issue.model';
import { FormBuilder } from '@angular/forms';

describe('TitleComponent', () => {
  let titleComponent: TitleComponent;
  let issueService: any;
  let permissionService: any;
  let labelService: any;
  let thisIssue: Issue;

  let formBuilder: any;
  const errorHandlingService: any = null;

  beforeEach(() => {
    labelService = jasmine.createSpyObj(LabelService, ['getLabelList',
      'getColorOfLabel', 'isDarkColor']);
    formBuilder = new FormBuilder();
    issueService = jasmine.createSpyObj('IssueService', ['updateIssue']);
    permissionService = new PermissionService(null, null, null);

    titleComponent = new TitleComponent(issueService, formBuilder, errorHandlingService, labelService, permissionService);
    thisIssue =  Issue.createPhaseBugReportingIssue(ISSUE_WITH_EMPTY_DESCRIPTION);
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

  it('should be updated with correct flags when editing mode is off', () => {
    titleComponent.ngOnInit();
    titleComponent.changeToEditMode();
    titleComponent.cancelEditMode();
    expect(titleComponent.isEditing).toEqual(false);
  });
});
