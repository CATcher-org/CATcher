import { BehaviorSubject } from 'rxjs';
import { Issue } from '../../../../src/app/core/models/issue.model';
import { Team } from '../../../../src/app/core/models/team.model';
import { ISSUE_WITH_ASSIGNEES, ISSUE_WITH_EMPTY_DESCRIPTION } from '../../../constants/githubissue.constants';
import { TABLE_COLUMNS } from '../../../../src/app/shared/issue-tables/issue-tables.component';
import { IssueService } from '../../../../src/app/core/services/issue.service';
import { MatPaginator, MatPaginatorIntl, MAT_PAGINATOR_INTL_PROVIDER_FACTORY } from '@angular/material';
import { applySearchFilter } from '../../../../src/app/shared/issue-tables/search-filter';
import { ChangeDetectorRef } from '@angular/core';
import { injectChangeDetectorRef } from '@angular/core/src/render3/view_engine_compatibility';


fdescribe('search-filter', () => {
    describe('applySearchFilter()', () => {
        const dummyTeam: Team = new Team({
        id: 'dummyId',
        teamMembers: [],
        });
        let dummySearchKey: string;
        const dummyIssue: Issue = Issue.createPhaseTeamResponseIssue(ISSUE_WITH_EMPTY_DESCRIPTION, dummyTeam);
        const otherDummyIssue: Issue = Issue.createPhaseTeamResponseIssue(ISSUE_WITH_ASSIGNEES, dummyTeam);
        //const duplicateOfDummyIssue: Issue = Issue
        const issuesList: Issue[] = [dummyIssue, otherDummyIssue];

        const filter: string = new BehaviorSubject('').value;
        const displayedColumn: string[] = [
            TABLE_COLUMNS.ID,
            TABLE_COLUMNS.TITLE,
            TABLE_COLUMNS.TYPE,
            TABLE_COLUMNS.SEVERITY,
            TABLE_COLUMNS.RESPONSE,
            TABLE_COLUMNS.ASSIGNEE,
            TABLE_COLUMNS.DUPLICATED_ISSUES,
            TABLE_COLUMNS.ACTIONS
        ];
        const issueService: IssueService = new IssueService(null, null, null, null, null, null);
        const paginator: MatPaginator = new MatPaginator(new MatPaginatorIntl(), null);


        beforeEach(() => {
            issueService.updateLocalStore(dummyIssue);
            issueService.updateLocalStore(otherDummyIssue);
        });

        it('returns filtered list of issues which includes issues that contain the search key in any of its assignees', () => {
            dummySearchKey = 'a';
            console.log(applySearchFilter(dummySearchKey, displayedColumn, issueService, paginator, issuesList));
            //expect(applySearchFilter(dummySearchKey, displayedColumn, issueService, paginator, issuesList)).toEqual([]);
        });

        // it('returns filtered list of issues which includes issues that contain the search key in any of its duplicate issues id', () => {
        //     expect(applySearchFilter(dummySearchKey, )).toBeTrue;
        // });

        // it('returns filtered list of issues which includes issues that contain the search key in any other column', () => {
        //     expect(applySearchFilter(dummySearchKey, )).toBeTrue;
        // });

        // it('returns filtered list which does not include issues that do not contain the search key in any column', () => {
        //     expect(applySearchFilter(dummySearchKey, )).toBeTrue;
        // });
    });
});