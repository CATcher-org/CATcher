import { MatPaginator } from "@angular/material";
import { Issue } from "../../../../src/app/core/models/issue.model";
import { TEAM_4 } from "../../../constants/data.constants";
import {
    ISSUE_WITH_ASSIGNEES,
    ISSUE_WITH_EMPTY_DESCRIPTION,
    ISSUE_WITH_EMPTY_DESCRIPTION_HIGH_SEVERITY,
    ISSUE_WITH_EMPTY_DESCRIPTION_LOW_SEVERITY
} from "../../../constants/githubissue.constants";
import { getPaginatedData } from '../../../../src/app/shared/issue-tables/issue-tables-paginated-data'

fdescribe('isses-table-paginated-data', () => {
    describe('getPaginatedData()', () => {
        let paginator: MatPaginator;
        const dummyTeam = TEAM_4;
        const mediumSeverityIssueWithResponse: Issue = Issue.createPhaseTeamResponseIssue(ISSUE_WITH_EMPTY_DESCRIPTION, dummyTeam);
        const mediumSeverityIssueWithAssigneee: Issue = Issue.createPhaseTeamResponseIssue(ISSUE_WITH_ASSIGNEES, dummyTeam);
        const lowSeverityFeatureFlawIssue: Issue = Issue.createPhaseTeamResponseIssue(ISSUE_WITH_EMPTY_DESCRIPTION_LOW_SEVERITY, dummyTeam);
        const highSeverityDocumentationBugIssue: Issue =
            Issue.createPhaseTeamResponseIssue(ISSUE_WITH_EMPTY_DESCRIPTION_HIGH_SEVERITY, dummyTeam);
        const dataSet_3: Issue[] = [mediumSeverityIssueWithResponse, mediumSeverityIssueWithAssigneee, lowSeverityFeatureFlawIssue];
        const dataSet_4: Issue[] = [mediumSeverityIssueWithResponse, mediumSeverityIssueWithAssigneee, lowSeverityFeatureFlawIssue, highSeverityDocumentationBugIssue];

        beforeEach(() => {
            paginator = new MatPaginator(null, null);
        });

        it('should set the length of paginator to the length of data', () => {
            getPaginatedData(paginator, dataSet_3);
            expect(paginator.length).toEqual(3);
        });

    })
})