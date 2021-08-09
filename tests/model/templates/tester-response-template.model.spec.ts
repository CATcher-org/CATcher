import { TesterResponseTemplate } from '../../../src/app/core/models/templates/tester-response-template.model';

import { TEAM_RESPONSE_MULTIPLE_DISAGREEMENT } from '../../constants/githubcomment.constants';

const SEVERITY_LOW = 'Low';
const TYPE_DOCUMENTATION_BUG = 'DocumentationBug';

describe('TesterResponseTemplate class', () => {
  describe('teamChosenType and teamChosenSeverity fields', () => {
    it('parses the teamChosenType and teamChosenSeverity values correctly from the GithubComment', () => {
      const template = new TesterResponseTemplate([TEAM_RESPONSE_MULTIPLE_DISAGREEMENT]);

      expect(template.teamChosenSeverity).toBe(SEVERITY_LOW);
      expect(template.teamChosenType).toBe(TYPE_DOCUMENTATION_BUG);
    });
  });
});
