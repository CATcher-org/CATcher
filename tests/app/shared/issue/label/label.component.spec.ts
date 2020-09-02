import { LabelComponent } from '../../../../../src/app/shared/issue/label/label.component';
import { LabelService } from '../../../../../src/app/core/services/label.service';
import { PermissionService } from '../../../../../src/app/core/services/permission.service';
import { ISSUE_WITH_EMPTY_DESCRIPTION } from '../../../../constants/githubissue.constants';
import { Issue } from '../../../../../src/app/core/models/issue.model';
import { SEVERITY_LABELS, COLOR_SEVERITY_LOW, SEVERITY, COLOR_SEVERITY_HIGH } from '../../../../constants/label.constants';

describe('LabelDropdownComponent', () => {
  let labelComponent: LabelComponent;
  let issueService: any;
  let permissionService: any;
  let labelService: any;
  let thisIssue: Issue;

  const formBuilder: any = null;
  const errorHandlingService: any = null;

  beforeEach(() => {
    labelService = jasmine.createSpyObj(LabelService, ['getLabelList',
      'getColorOfLabel', 'isDarkColor']);
    issueService = jasmine.createSpyObj('IssueService', ['updateIssue']);
    permissionService = new PermissionService(null, null, null);

    labelComponent = new LabelComponent(issueService, formBuilder, errorHandlingService, labelService, permissionService);
    thisIssue =  Issue.createPhaseBugReportingIssue(ISSUE_WITH_EMPTY_DESCRIPTION);
    labelComponent.issue = thisIssue;
    labelComponent.attributeName = SEVERITY;

  });

  it('should be initialised with a list of labels, an initial colour and a dropdown control', () => {
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

    issueService.updateIssue.and.returnValue({ subscribe: (latestIssue) => {
      labelComponent.issueUpdated.emit(latestIssue);
      labelComponent.labelColor = labelService.getColorOfLabel(COLOR_SEVERITY_HIGH);
    } });

    labelComponent.updateLabel(COLOR_SEVERITY_HIGH);

    expect(labelComponent.labelValues).toEqual(SEVERITY_LABELS);
    expect(labelComponent.labelColor).toEqual(COLOR_SEVERITY_HIGH);
  });
});
