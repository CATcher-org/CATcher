import { Issue } from '../../../../src/app/core/models/issue.model';
import { Team } from '../../../../src/app/core/models/team.model';
import { DUPLICATED_ISSUE_WITH_EMPTY_DESCRIPTION_HIGH_SEVERITY, ISSUE_WITH_ASSIGNEES, ISSUE_WITH_EMPTY_DESCRIPTION,
    ISSUE_WITH_EMPTY_DESCRIPTION_HIGH_SEVERITY, ISSUE_WITH_EMPTY_DESCRIPTION_LOW_SEVERITY } from '../../../constants/githubissue.constants';
import { TABLE_COLUMNS } from '../../../../src/app/shared/issue-tables/issue-tables.component';
import { IssueService } from '../../../../src/app/core/services/issue.service';
import { applySearchFilter } from '../../../../src/app/shared/issue-tables/search-filter';
import { USER_ANUBHAV } from '../../../constants/data.constants';

describe('search-filter', () => {
    describe('applySearchFilter()', () => {
        const dummyTeam: Team = new Team({
        id: 'dummyId',
        teamMembers: [],
        });
        let dummySearchKey: string;
        const mediumSeverityIssueWithResponse: Issue = Issue.createPhaseTeamResponseIssue(ISSUE_WITH_EMPTY_DESCRIPTION, dummyTeam);
        mediumSeverityIssueWithResponse.responseTag = 'Accepted';
        const mediumSeverityIssueWithAssigneee: Issue = Issue.createPhaseTeamResponseIssue(ISSUE_WITH_ASSIGNEES, dummyTeam);
        const lowSeverityFeatureFlawIssue: Issue = Issue.createPhaseTeamResponseIssue(ISSUE_WITH_EMPTY_DESCRIPTION_LOW_SEVERITY, dummyTeam);
        const highSeverityDocumentationBugIssue: Issue =
            Issue.createPhaseTeamResponseIssue(ISSUE_WITH_EMPTY_DESCRIPTION_HIGH_SEVERITY, dummyTeam);
        const duplicatedIssue: Issue = Issue.createPhaseTeamResponseIssue(DUPLICATED_ISSUE_WITH_EMPTY_DESCRIPTION_HIGH_SEVERITY, dummyTeam);
        duplicatedIssue.duplicateOf = highSeverityDocumentationBugIssue.id;

        const issuesList: Issue[] = [
            mediumSeverityIssueWithResponse,
            mediumSeverityIssueWithAssigneee,
            lowSeverityFeatureFlawIssue,
            highSeverityDocumentationBugIssue
        ];
        const displayedColumn: string[] = [
            TABLE_COLUMNS.ID,
            TABLE_COLUMNS.TITLE,
            TABLE_COLUMNS.TYPE,
            TABLE_COLUMNS.SEVERITY,
            TABLE_COLUMNS.RESPONSE,
            TABLE_COLUMNS.ASSIGNEE,
            TABLE_COLUMNS.DUPLICATED_ISSUES,
        ];
        const issueService: IssueService = new IssueService(null, null, null, null, null, null);

        beforeEach(() => {
            issueService.updateLocalStore(mediumSeverityIssueWithResponse);
            issueService.updateLocalStore(mediumSeverityIssueWithAssigneee);
            issueService.updateLocalStore(lowSeverityFeatureFlawIssue);
            issueService.updateLocalStore(highSeverityDocumentationBugIssue);
            issueService.updateLocalStore(duplicatedIssue);
        });

        it('returns filtered list of issues which includes issues that contain the search key in any of its assignees', () => {
            dummySearchKey = USER_ANUBHAV.loginId;
            expect(applySearchFilter(dummySearchKey, displayedColumn, issueService, issuesList))
                .toEqual([mediumSeverityIssueWithAssigneee]);
        });

        it('returns filtered list of issues which includes issues that contain the search key in any of its duplicate issues id', () => {
            dummySearchKey = duplicatedIssue.id.toString();
            expect(applySearchFilter(dummySearchKey, displayedColumn, issueService, issuesList))
                .toEqual([highSeverityDocumentationBugIssue]);
        });

        it('returns filtered list of issues which includes issues that contain the search key in any other column', () => {
            // Checks id of issue
            dummySearchKey = mediumSeverityIssueWithResponse.id.toString();
            expect(applySearchFilter(dummySearchKey, displayedColumn, issueService, issuesList))
                .toEqual([mediumSeverityIssueWithResponse]);

            // Checks title of issue
            dummySearchKey = mediumSeverityIssueWithAssigneee.title;
            expect(applySearchFilter(dummySearchKey, displayedColumn, issueService, issuesList))
                .toEqual([mediumSeverityIssueWithAssigneee]);

            // Checks type of issue
            dummySearchKey = highSeverityDocumentationBugIssue.type;
            expect(applySearchFilter(dummySearchKey, displayedColumn, issueService, issuesList))
                .toEqual([highSeverityDocumentationBugIssue]);

            // Checks severity of issue
            dummySearchKey = lowSeverityFeatureFlawIssue.severity;
            expect(applySearchFilter(dummySearchKey, displayedColumn, issueService, issuesList))
                .toEqual([lowSeverityFeatureFlawIssue]);

            // Checks response of issue
            dummySearchKey = mediumSeverityIssueWithResponse.responseTag;
            expect(applySearchFilter(dummySearchKey, displayedColumn, issueService, issuesList))
               .toEqual([mediumSeverityIssueWithResponse]);
        });
    });
});
