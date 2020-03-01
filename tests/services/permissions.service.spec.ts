import { PermissionService } from '../../src/app/core/services/permission.service';
import { Phase, PhaseService } from '../../src/app/core/services/phase.service';
import { UserService } from '../../src/app/core/services/user.service';
import { UserRole } from '../../src/app/core/models/user.model';

const testStudent = {
    loginId: 'TestStudent',
    role: UserRole.Student
};

const testTutor = {
    loginId: 'TestTutor',
    role: UserRole.Tutor
}

const testAdmin = {
    loginId: 'testAdmin',
    role: UserRole.Admin
}

let permissionService: PermissionService;
let mockUserService = new UserService(null, null);
let mockPhaseService = new PhaseService(null, null, null, null, null);

describe('test bug reporting phase permissions', () => {
    beforeAll(() => {
        mockPhaseService.currentPhase = Phase.phaseBugReporting;
    });

    describe('test student permissions', () => {
        beforeAll(() => {
            mockUserService.currentUser = testStudent;
            permissionService = new PermissionService(null, mockUserService, mockPhaseService);
        });

        it('Student should be only able to edit bug reports', () => {
            expect(permissionService.isIssueCreatable()).toBe(true);
            expect(permissionService.isIssueDeletable()).toBe(true);
            expect(permissionService.isIssueDescriptionEditable()).toBe(true);
            expect(permissionService.isIssueEditable()).toBe(true);
            expect(permissionService.isIssueLabelsEditable()).toBe(true);
            expect(permissionService.isIssueTitleEditable()).toBe(true);
            expect(permissionService.isTeamResponseEditable()).toBe(false);
            expect(permissionService.isTutorResponseEditable()).toBe(false);
        });
    });

    describe('test tutor permissions', () => {
        beforeAll(() => {
            mockUserService.currentUser = testTutor;
            permissionService = new PermissionService(null, mockUserService, mockPhaseService);
        });
        it('Tutor should not be able to take any action', () => {
            expect(permissionService.isIssueCreatable()).toBe(false);
            // ... to add on after review
        });
    });

    // .... to add on tests for admin
});

// ... to add on tests for other phases
