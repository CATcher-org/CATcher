import { of } from 'rxjs';
import { Issue } from '../../../../../src/app/core/models/issue.model';
import { Phase } from '../../../../../src/app/core/models/phase.model';
import { LabelService } from '../../../../../src/app/core/services/label.service';
import { LoadingService } from '../../../../../src/app/core/services/loading.service';
import { PhaseService } from '../../../../../src/app/core/services/phase.service';
import { LabelComponent } from '../../../../../src/app/shared/issue/label/label.component';
import { ISSUE_WITH_EMPTY_DESCRIPTION } from '../../../../constants/githubissue.constants';
import { COLOR_SEVERITY_HIGH, COLOR_SEVERITY_LOW, SEVERITY, SEVERITY_HIGH, SEVERITY_LABELS } from '../../../../constants/label.constants';

describe('LabelComponent', () => {
  let labelComponent: any;
  let issueService: any;
  let labelService: any;
  let phaseService: any;
  let thisIssue: Issue;
  let issueUpdatedEmit: any;
  let loadingService: jasmine.SpyObj<LoadingService>;

  beforeEach(() => {
    labelService = jasmine.createSpyObj(LabelService, ['getLabelList', 'getColorOfLabel']);
    issueService = jasmine.createSpyObj('IssueService', ['getDuplicateIssuesFor', 'updateIssue']);
    phaseService = jasmine.createSpyObj(PhaseService, ['currentPhase']);
    loadingService = jasmine.createSpyObj('LoadingService', [
      'showLoader',
      'hideLoader',
      'addAnimationMode',
      'addCssClasses',
      'addSpinnerOptions',
      'addTheme',
      'addViewContainerRef'
    ]);
    loadingService.addAnimationMode.and.callFake(() => loadingService);
    loadingService.addCssClasses.and.callFake(() => loadingService);
    loadingService.addSpinnerOptions.and.callFake(() => loadingService);
    loadingService.addTheme.and.callFake(() => loadingService);
    loadingService.addViewContainerRef.and.callFake(() => loadingService);
    labelComponent = new LabelComponent(issueService, null, phaseService, labelService, null, null, loadingService);
    thisIssue = Issue.createPhaseBugReportingIssue(ISSUE_WITH_EMPTY_DESCRIPTION);
    labelComponent.issue = thisIssue;
    labelComponent.attributeName = SEVERITY;

    issueUpdatedEmit = spyOn(labelComponent.issueUpdated, 'emit');
  });

  it('should mark isSavePending as true if called', () => {
    labelComponent.isSavePending = false;
    loadingService.showLoader.and.callFake(() => {});
    labelComponent.showSpinner();

    expect(labelComponent.isSavePending).toEqual(true);
  });

  it('should mark isSavePending as false if called', () => {
    labelComponent.isSavePending = true;
    loadingService.hideLoader.and.callFake(() => {});
    labelComponent.hideSpinner();

    expect(labelComponent.isSavePending).toEqual(false);
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
    phaseService.currentPhase.and.returnValue(Phase.phaseBugReporting);
    issueService.updateIssue.and.callFake((x: Issue) => of(x));
    issueService.getDuplicateIssuesFor.and.returnValue(of([]));
    loadingService.showLoader.and.callFake(() => {});
    loadingService.hideLoader.and.callFake(() => {});
    labelComponent.updateLabel(SEVERITY_HIGH);

    expect(issueUpdatedEmit).toHaveBeenCalledTimes(1);
    expect(labelComponent.labelValues).toEqual(SEVERITY_LABELS);
    expect(labelComponent.labelColor).toEqual(COLOR_SEVERITY_HIGH);
    expect(labelComponent.isSavePending).toEqual(false);
  });

  it('should update labels of duplicate issues', () => {
    labelService.getLabelList.and.returnValue(SEVERITY_LABELS);
    labelService.getColorOfLabel.and.returnValue(COLOR_SEVERITY_LOW);
    labelComponent.ngOnInit();
    labelComponent.ngOnChanges();

    phaseService.currentPhase.and.returnValue(Phase.phaseTeamResponse);
    issueService.updateIssue.and.callFake((x: Issue) => of(x));

    const duplicateIssue = Issue.createPhaseBugReportingIssue(ISSUE_WITH_EMPTY_DESCRIPTION);
    issueService.getDuplicateIssuesFor.and.returnValue(of([duplicateIssue]));
    loadingService.showLoader.and.callFake(() => {});
    loadingService.hideLoader.and.callFake(() => {});
    labelComponent.updateLabel(SEVERITY_HIGH);

    const updatedIssue = thisIssue.clone(phaseService.currentPhase);
    updatedIssue.severity = SEVERITY_HIGH;
    const updatedDuplicateIssue = duplicateIssue.clone(phaseService.currentPhase);
    updatedDuplicateIssue.severity = SEVERITY_HIGH;

    expect(issueService.updateIssue).toHaveBeenCalledWith(updatedIssue);
    expect(issueService.updateIssue).toHaveBeenCalledWith(updatedDuplicateIssue);
    expect(labelComponent.isSavePending).toEqual(false);
  });
});
