import { Issue } from '../../src/app/core/models/issue.model'

describe('Issue model class', () => {
    describe('.updateDescription(description) and .updateTeamResponse(teamResponse)', () => {
        it('correctly clean strings obtained from users', () => {
            expect(Issue.updateDescription('')).toBe('No details provided by bug reporter.');
            expect(Issue.updateTeamResponse('')).toBe('No details provided by team.');
            expect(Issue.updateDescription(null)).toBe('No details provided by bug reporter.');
            expect(Issue.updateTeamResponse(undefined)).toBe('No details provided by team.');

            const typicalDescription = 'The app crashes after parsing config file.s'
            const typicalTeamResponse = 'Cannot replicate the bug.'
            expect(Issue.updateDescription(typicalDescription)).toBe(typicalDescription);
            expect(Issue.updateTeamResponse(typicalTeamResponse)).toBe(typicalTeamResponse);

            const inputWithSpecialChars = '$%^!@&&_0_99';
            expect(Issue.updateDescription(inputWithSpecialChars)).toBe(inputWithSpecialChars);
            expect(Issue.updateTeamResponse(inputWithSpecialChars)).toBe(inputWithSpecialChars);
        });
    });
});