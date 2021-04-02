import { DuplicatedIssuesComponent } from '../../../../../src/app/shared/issue/duplicatedIssues/duplicated-issues.component';
import { DebugElement } from "@angular/core";
import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { IssueService } from '../../../../../src/app/core/services/issue.service';
import { ErrorHandlingService } from '../../../../../src/app/core/services/error-handling.service';
import { PhaseService } from '../../../../../src/app/core/services/phase.service';
import { PermissionService } from '../../../../../src/app/core/services/permission.service';
import { Observable, of } from 'rxjs';
import { Issue } from '../../../../../src/app/core/models/issue.model';
import { TEAM_4 } from '../../../../constants/data.constants';
import {
    ISSUE_PENDING_MODERATION,
    ISSUE_PENDING_MODERATION_HIGH_SEVERITY_FEATURE_FLAW,
    ISSUE_PENDING_MODERATION_LOW_SEVERITY_DOCUMENTATION_BUG
    } from '../../../../constants/githubissue.constants';
import { By, HAMMER_LOADER } from '@angular/platform-browser';
import { MaterialModule } from '../../../../../src/app/shared/material.module';
import { RouterTestingModule } from '@angular/router/testing';
import { ApolloTestingModule } from 'apollo-angular/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { Phase } from '../../../../../src/app/core/models/phase.model';

describe('DuplicatedIssuesComponent', () => {
    let component: DuplicatedIssuesComponent;
    let debugElement: DebugElement;
    let nativeElement: HTMLElement;
    let fixture: ComponentFixture<DuplicatedIssuesComponent>;
    let dummyDuplicatedIssues: Observable<Issue[]>;
    let thisIssue: Issue;

    const dummyTeam = TEAM_4;
    const firstDummyIssue =  Issue.createPhaseModerationIssue(ISSUE_PENDING_MODERATION_HIGH_SEVERITY_FEATURE_FLAW, dummyTeam);
    const secondDummyIssue = Issue.createPhaseModerationIssue(ISSUE_PENDING_MODERATION_LOW_SEVERITY_DOCUMENTATION_BUG, dummyTeam);

    const permissionService: any = jasmine.createSpyObj('PermissionService', ['isTeamResponseEditable', 'isTutorResponseEditable']);
    const issueService: any = jasmine.createSpyObj('IssueService', ['getDuplicateIssuesFor', 'updateIssueWithComment', 'updateIssue', 'updateLocalStore']);
    const phaseService: any = jasmine.createSpyObj('PhaseService', [], { currentPhase: Phase.phaseModeration });

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                DuplicatedIssuesComponent
            ],
            providers: [
                IssueService, ErrorHandlingService, PhaseService, PermissionService, {
                    provide: HAMMER_LOADER,
                    useValue: () => new Promise(() => {})
                  }
            ],
            imports: [
                MaterialModule, RouterTestingModule, BrowserDynamicTestingModule, ApolloTestingModule, HttpClientTestingModule
            ]
        })
        .overrideProvider(PermissionService, { useValue: permissionService })
        .overrideProvider(IssueService, { useValue: issueService})
        .overrideProvider(PhaseService, { useValue: phaseService})
        .compileComponents();
    }));

    beforeEach(() => {
        dummyDuplicatedIssues = of([firstDummyIssue, secondDummyIssue]);
        issueService.getDuplicateIssuesFor.and.callFake(() => dummyDuplicatedIssues);

        thisIssue = Issue.createPhaseModerationIssue(ISSUE_PENDING_MODERATION, dummyTeam);
        firstDummyIssue.duplicateOf = thisIssue.id;
        secondDummyIssue.duplicateOf = thisIssue.id;

        fixture = TestBed.createComponent(DuplicatedIssuesComponent);
        component = fixture.componentInstance;
        component.issue = thisIssue;
        fixture.detectChanges();

        debugElement = fixture.debugElement;
        nativeElement = fixture.nativeElement;
    });

    it('should create a chip for each duplicated issue', () => {
        // Check that the number of chips is the same as the number of duplicate issues
        const matChipListLength: number = debugElement.queryAll(By.css('.mat-chip')).length;
        const duplicateIssueslength: number = getDuplicateIssuesLength();
        expect(matChipListLength).toEqual(duplicateIssueslength);

        // Check that first chip contains information on first issue in the duplicate issues array
        const matChipAnchor: HTMLElement = nativeElement.querySelector('a');
        expect(matChipAnchor.innerText).toEqual(`#${firstDummyIssue.id}`);
    });

    it('should only allow cancellation of duplicate status if team/tutor response is editable', () => {
        // Team/tutor response is not editable
        permissionService.isTeamResponseEditable.and.callFake(() => false);
        permissionService.isTutorResponseEditable.and.callFake(() => false);
        const cancelIconQuery = debugElement.query(By.css('.mat-icon'));
        expect(cancelIconQuery).toBeNull();

        // Team response is editable
        permissionService.isTeamResponseEditable.and.callFake(() => true);
        permissionService.isTutorResponseEditable.and.callFake(() => false);
        fixture.detectChanges();
        let cancelIcon: HTMLElement = debugElement.query(By.css('.mat-icon')).nativeElement;
        expect(cancelIcon).toBeDefined();

        // Tutor response is editable
        permissionService.isTeamResponseEditable.and.callFake(() => false);
        permissionService.isTutorResponseEditable.and.callFake(() => true);
        fixture.detectChanges();
        cancelIcon = debugElement.query(By.css('.mat-icon')).nativeElement;
        expect(cancelIcon).toBeDefined();
    });

    it('should remove duplicate status of an duplicated issue once cancel icon is clicked', () => {
        let updatedFirstDummyIssue: Issue;
        issueService.updateIssueWithComment.and.callFake((duplicatedIssue: Issue) => {
            updatedFirstDummyIssue = duplicatedIssue;
            return of(duplicatedIssue);
        });
        spyOn(component, 'removeDuplicateStatus').and.callThrough();
        permissionService.isTeamResponseEditable.and.callFake(() => true);
        fixture.detectChanges();

        expect(firstDummyIssue.duplicateOf).toEqual(component.issue.id);
        cancelDuplicateStatus();
        expect(component.removeDuplicateStatus).toHaveBeenCalledWith(firstDummyIssue);
        expect(updatedFirstDummyIssue.duplicateOf).toBeNull();
        expect(issueService.updateLocalStore).toHaveBeenCalledWith(updatedFirstDummyIssue);

        // duplicate status of first dummy issue is removed
        component.duplicatedIssues = of([secondDummyIssue]);
        fixture.detectChanges();

        const matChipAnchor: HTMLElement = nativeElement.querySelector('a');
        expect(matChipAnchor.innerText).toEqual(`#${secondDummyIssue.id}`);
    });

    function getDuplicateIssuesLength(): number {
        let length: number;
        component.duplicatedIssues.subscribe(x => length = x.length);
        return length;
    }

    function cancelDuplicateStatus(): void {
        const cancelIcon: HTMLElement = debugElement.query(By.css('.mat-icon')).nativeElement;
        cancelIcon.click();
        fixture.detectChanges();
    }
});
