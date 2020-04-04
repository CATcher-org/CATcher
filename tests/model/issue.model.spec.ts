import { Issue } from '../../src/app/core/models/issue.model'

describe('Issue model class', () => {
    describe('.updateDescription(description) and .updateTeamResponse(teamResponse)', () => {
        it('correctly clean strings obtained from users', () => {
            const noDetailsFromBugReporter = 'No details provided by bug reporter.';
            const noDetailsFromTeam = 'No details provided by team.';
            expect(Issue.updateDescription('')).toBe(noDetailsFromBugReporter);
            expect(Issue.updateTeamResponse('')).toBe(noDetailsFromTeam);
            expect(Issue.updateDescription(null)).toBe(noDetailsFromBugReporter);
            expect(Issue.updateTeamResponse(undefined)).toBe(noDetailsFromTeam);

            const typicalDescription = 'The app crashes after parsing config files.'
            const typicalTeamResponse = 'Cannot replicate the bug.'
            expect(Issue.updateDescription(typicalDescription)).toBe(typicalDescription);
            expect(Issue.updateTeamResponse(typicalTeamResponse)).toBe(typicalTeamResponse);

            const inputWithSpecialChars = '$%^!@&-_test';
            expect(Issue.updateDescription(inputWithSpecialChars)).toBe(inputWithSpecialChars);
            expect(Issue.updateTeamResponse(inputWithSpecialChars)).toBe(inputWithSpecialChars);
        });
    });
});