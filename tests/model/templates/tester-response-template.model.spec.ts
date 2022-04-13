import { TesterResponseParser, TesterResponseTemplate } from '../../../src/app/core/models/templates/tester-response-template.model';

import { TEAM_RESPONSE_MULTIPLE_DISAGREEMENT } from '../../constants/githubcomment.constants';

const SEVERITY_LOW = 'Low';
const TYPE_DOCUMENTATION_BUG = 'DocumentationBug';

const EXPECTED_TEAM_RESPONSE_CONTENT = 'This is a dummy team response comment: Thanks for the feedback';
const EXPECTED_TEAM_RESPONSE_HEADER = "# Team's Response";

const ISSUE_SEVERITY_TITLE = 'Issue severity';
const ISSUE_TYPE_TITLE = 'Issue type';
const DISAGREE_CHECKBOX = '- [ ] I disagree';
const DISAGREE_REASON = '[replace this with your reason]';

const ISSUE_SEVERITY_DESCRIPTION = 'Team chose [`severity.Low`]\nOriginally [`severity.High`]';
const ISSUE_TYPE_DESCRIPTION = 'Team chose [`type.DocumentationBug`]\nOriginally [`type.FunctionalityBug`]';

describe('TesterResponseParser', () => {
  describe('testerDisagree, teamChosenSeverity and teamChosenType fields', () => {
    it('fields are parsed correctly from the body of the GithubComment', () => {
      const result = TesterResponseParser.run(TEAM_RESPONSE_MULTIPLE_DISAGREEMENT.body).result;

      expect(result.testerDisagree).toBe(false);
      expect(result.teamChosenSeverity).toBe(SEVERITY_LOW);
      expect(result.teamChosenType).toBe(TYPE_DOCUMENTATION_BUG);
    });
  });
  describe('testerResponse and teamResponse fields', () => {
    it('parses the fields correctly from the body of the GithubComment', () => {
      const result = TesterResponseParser.run(TEAM_RESPONSE_MULTIPLE_DISAGREEMENT.body).result;

      expect(result.teamResponse).toBe(EXPECTED_TEAM_RESPONSE_CONTENT);

      expect(result.testerResponses[0].title).toBe(ISSUE_SEVERITY_TITLE);
      expect(result.testerResponses[0].description).toBe(ISSUE_SEVERITY_DESCRIPTION);
      expect(result.testerResponses[0].disagreeCheckbox.toString()).toBe(DISAGREE_CHECKBOX);
      expect(result.testerResponses[0].reasonForDisagreement).toBe(DISAGREE_REASON);

      expect(result.testerResponses[1].title).toBe(ISSUE_TYPE_TITLE);
      expect(result.testerResponses[1].description).toBe(ISSUE_TYPE_DESCRIPTION);
      expect(result.testerResponses[1].disagreeCheckbox.toString()).toBe(DISAGREE_CHECKBOX);
      expect(result.testerResponses[1].reasonForDisagreement).toBe(DISAGREE_REASON);
    });
  });
});

describe('TesterResponseTemplate class', () => {
  describe('teamChosenType and teamChosenSeverity fields', () => {
    it('parses the teamChosenType and teamChosenSeverity values correctly from the GithubComment', () => {
      const template = new TesterResponseTemplate([TEAM_RESPONSE_MULTIPLE_DISAGREEMENT]);

      expect(template.teamChosenSeverity).toBe(SEVERITY_LOW);
      expect(template.teamChosenType).toBe(TYPE_DOCUMENTATION_BUG);
    });
  });
  describe('testerResponse and teamResponse fields', () => {
    it('parses the testerResponse and teamResponse fields correctly from the GithubComment', () => {
      const template = new TesterResponseTemplate([TEAM_RESPONSE_MULTIPLE_DISAGREEMENT]);

      expect(template.teamResponse.content).toBe(EXPECTED_TEAM_RESPONSE_CONTENT);
      expect(template.teamResponse.header.toString()).toBe(EXPECTED_TEAM_RESPONSE_HEADER);

      expect(template.testerResponse.testerResponses[0].title).toBe(ISSUE_SEVERITY_TITLE);
      expect(template.testerResponse.testerResponses[0].description).toBe(ISSUE_SEVERITY_DESCRIPTION);
      expect(template.testerResponse.testerResponses[0].disagreeCheckbox.toString()).toBe(DISAGREE_CHECKBOX);
      expect(template.testerResponse.testerResponses[0].reasonForDisagreement).toBe(DISAGREE_REASON);

      expect(template.testerResponse.testerResponses[1].title).toBe(ISSUE_TYPE_TITLE);
      expect(template.testerResponse.testerResponses[1].description).toBe(ISSUE_TYPE_DESCRIPTION);
      expect(template.testerResponse.testerResponses[1].disagreeCheckbox.toString()).toBe(DISAGREE_CHECKBOX);
      expect(template.testerResponse.testerResponses[1].reasonForDisagreement).toBe(DISAGREE_REASON);
    });
  });
});
