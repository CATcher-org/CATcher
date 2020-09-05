import { LabelComponent } from '../../../../../src/app/shared/issue/label/label.component';
import { LabelService } from '../../../../../src/app/core/services/label.service';
import { PermissionService } from '../../../../../src/app/core/services/permission.service';
import { ISSUE_WITH_EMPTY_DESCRIPTION } from '../../../../constants/githubissue.constants';
import { Issue } from '../../../../../src/app/core/models/issue.model';
import { SEVERITY_LABELS, COLOR_SEVERITY_LOW, SEVERITY, COLOR_SEVERITY_HIGH, SEVERITY_HIGH } from '../../../../constants/label.constants';
import { of } from 'rxjs';

describe('LabelComponent', () => {
  let labelComponent: any;
  let issueService: any;
  let permissionService: any;
  let labelService: any;
  let thisIssue: Issue;
  let issueUpdatedEmit: any;

  const formBuilder: any = null;
  const errorHandlingService: any = null;

  beforeEach(() => {
    labelService = jasmine.createSpyObj(LabelService, ['getLabelList',
      'getColorOfLabel', 'isDarkColor', 'getRequiredLabelsAsArray']);
    issueService = jasmine.createSpyObj('IssueService', ['updateIssue']);
    permissionService = new PermissionService(null, null, null);

    labelComponent = new LabelComponent(issueService, formBuilder, errorHandlingService, labelService, permissionService);
    thisIssue =  Issue.createPhaseBugReportingIssue(ISSUE_WITH_EMPTY_DESCRIPTION);
    labelComponent.issue = thisIssue;
    labelComponent.attributeName = SEVERITY;

    issueUpdatedEmit = spyOn(labelComponent.issueUpdated, 'emit');
  });

  it('should be initialised with a list of label values and a labelColor', () => {
    labelService.getLabelList.and.returnValue(SEVERITY_LABELS);
    labelService.getColorOfLabel.and.returnValue(COLOR_SEVERITY_LOW);
    labelComponent.ngOnInit();
    labelComponent.ngOnChanges();

    expect(labelComponent.labelValues).toEqual(SEVERITY_LABELS);
    expect(labelComponent.labelColor).toEqual(COLOR_SEVERITY_LOW);
  });

  it('should change label color when updateLabel is called', () => {
    labelService.getLabelList.and.returnValue(SEVERITY_LABELS);
    labelService.getColorOfLabel.and.returnValue(COLOR_SEVERITY_LOW);
    labelComponent.ngOnInit();
    labelComponent.ngOnChanges();

    labelService.getColorOfLabel.and.returnValue(COLOR_SEVERITY_HIGH);
    issueService.updateIssue.and.callFake((x: Issue) => of(x));
    labelComponent.updateLabel(SEVERITY_HIGH);

    expect(issueUpdatedEmit).toHaveBeenCalledTimes(1);
    expect(labelComponent.labelValues).toEqual(SEVERITY_LABELS);
    expect(labelComponent.labelColor).toEqual(COLOR_SEVERITY_HIGH);
  });
});
