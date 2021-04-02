import { MatPaginator, MatPaginatorIntl } from "@angular/material";
import { Issue } from "../../../../src/app/core/models/issue.model";
import { TEAM_4 } from "../../../constants/data.constants";
import {
    ISSUE_WITH_ASSIGNEES,
    ISSUE_WITH_EMPTY_DESCRIPTION,
    ISSUE_WITH_EMPTY_DESCRIPTION_HIGH_SEVERITY,
    ISSUE_WITH_EMPTY_DESCRIPTION_LOW_SEVERITY
} from "../../../constants/githubissue.constants";
import { setAndGetPaginatedData } from '../../../../src/app/shared/issue-tables/issue-tables-paginated-data';

describe('isses-table-paginated-data', () => {
    describe('getPaginatedData()', () => {
        const changeDetectorRefMock = {
            detectChanges: () => null,
            markForCheck: () => null,
            detach: () => null,
            reattach: () => null,
            checkNoChanges: () => null
        };
        let dataSet_3: Issue[];
        let dataSet_7: Issue[];
        let paginator: MatPaginator;
        const dummyTeam = TEAM_4;
        const mediumSeverityIssueWithResponse: Issue = Issue.createPhaseTeamResponseIssue(ISSUE_WITH_EMPTY_DESCRIPTION, dummyTeam);
        const mediumSeverityIssueWithAssigneee: Issue = Issue.createPhaseTeamResponseIssue(ISSUE_WITH_ASSIGNEES, dummyTeam);
        const lowSeverityFeatureFlawIssue: Issue = Issue.createPhaseTeamResponseIssue(ISSUE_WITH_EMPTY_DESCRIPTION_LOW_SEVERITY, dummyTeam);
        const highSeverityDocumentationBugIssue: Issue =
            Issue.createPhaseTeamResponseIssue(ISSUE_WITH_EMPTY_DESCRIPTION_HIGH_SEVERITY, dummyTeam);

        beforeEach(() => {
            dataSet_3 = [
                mediumSeverityIssueWithResponse,
                mediumSeverityIssueWithAssigneee,
                lowSeverityFeatureFlawIssue
            ];
            dataSet_7 = [
                mediumSeverityIssueWithResponse,
                mediumSeverityIssueWithAssigneee,
                lowSeverityFeatureFlawIssue,
                mediumSeverityIssueWithResponse,
                mediumSeverityIssueWithAssigneee,
                lowSeverityFeatureFlawIssue,
                highSeverityDocumentationBugIssue
            ];
            paginator = new MatPaginator(new MatPaginatorIntl(), changeDetectorRefMock);
            paginator.pageSize = 3;
        });

        it('should set the length of paginator to the length of data', () => {
            let issuesLength = dataSet_3.length;
            setAndGetPaginatedData(paginator, dataSet_3);
            expect(paginator.length).toEqual(issuesLength);

            issuesLength = dataSet_7.length;
            setAndGetPaginatedData(paginator, dataSet_7);
            expect(paginator.length).toEqual(issuesLength);
        });

        it('should return list of issues according to page index', () => {
            paginator.pageIndex = 0;

            // Returns issues index 0 to 2
            let dataSetCopy = [...dataSet_3];
            let listToBeReturned = dataSetCopy.splice(0, paginator.pageSize);
            let returnedList = setAndGetPaginatedData(paginator, dataSet_3);
            expect(returnedList).toEqual(listToBeReturned);

            // Returns issues index 0 to 2
            dataSetCopy = [...dataSet_7];
            listToBeReturned = dataSetCopy.splice(0, paginator.pageSize);
            returnedList = setAndGetPaginatedData(paginator, dataSet_7);
            expect(returnedList).toEqual(listToBeReturned);
        });

        it('should return list of issues in the previous page if there are no issues on the current page', () => {
            paginator.pageIndex = 1;

            // Returns issues index 0 to 2 on page 0
            let dataSetCopy = [...dataSet_3];
            let listToBeReturned = dataSetCopy.splice(0, paginator.pageSize);
            let returnedList = setAndGetPaginatedData(paginator, dataSet_3);
            expect(returnedList).toEqual(listToBeReturned);

            paginator.pageIndex = 3;

            // Returns issues index 6 on page 2
            dataSetCopy = [...dataSet_7];
            listToBeReturned = dataSetCopy.splice(paginator.pageSize * 2, paginator.pageSize);
            returnedList = setAndGetPaginatedData(paginator, dataSet_7);
            expect(returnedList).toEqual([highSeverityDocumentationBugIssue]);
        });

    });
});
