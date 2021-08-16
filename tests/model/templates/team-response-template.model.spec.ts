import { TeamResponseTemplate } from '../../../src/app/core/models/templates/team-response-template.model';

import { DUMMY_TEAM_RESPONSE } from '../../constants/githubcomment.constants';
import {
  DUPLICATE_ISSUE_NUMBER,
  EXPECTED_TEAM_RESPONSE_HEADER,
  EXPECTED_TEAM_RESPONSE_TEMPLATE_CONTENT,
  SIMPLE_TEAM_RESPONSE,
  TEAM_RESPONSE_WITH_DUPLICATE,
  TEAM_RESPONSE_WITH_WHITESPACE
} from './team-response-template.constants';

describe('TeamResponseTemplate class', () => {
  describe('teamResponse field', () => {
    it('creates the correct teamResponse value', () => {
      DUMMY_TEAM_RESPONSE.body = SIMPLE_TEAM_RESPONSE;
      const template = new TeamResponseTemplate([DUMMY_TEAM_RESPONSE]);

      expect(template.teamResponse.content.toString()).toBe(EXPECTED_TEAM_RESPONSE_TEMPLATE_CONTENT);
      expect(template.teamResponse.header.toString()).toBe(EXPECTED_TEAM_RESPONSE_HEADER);
      expect(template.teamResponse.parseError).toEqual(null);
      expect(template.duplicateOf.issueNumber).toEqual(null);
    });

    it('trims the content of the teamResponse correctly', () => {
      DUMMY_TEAM_RESPONSE.body = TEAM_RESPONSE_WITH_WHITESPACE;
      const template = new TeamResponseTemplate([DUMMY_TEAM_RESPONSE]);

      expect(template.teamResponse.content.toString()).toBe(EXPECTED_TEAM_RESPONSE_TEMPLATE_CONTENT);
      expect(template.teamResponse.header.toString()).toBe(EXPECTED_TEAM_RESPONSE_HEADER);
      expect(template.teamResponse.parseError).toEqual(null);
      expect(template.duplicateOf.issueNumber).toEqual(null);
    });
  });
  describe('duplicateOf field', () => {
    it('creates the correct duplicateOf value', () => {
      DUMMY_TEAM_RESPONSE.body = TEAM_RESPONSE_WITH_DUPLICATE;
      const template = new TeamResponseTemplate([DUMMY_TEAM_RESPONSE]);

      expect(template.duplicateOf.issueNumber).toBe(DUPLICATE_ISSUE_NUMBER);
    });
  });
});
