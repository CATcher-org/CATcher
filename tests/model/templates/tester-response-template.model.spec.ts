import { TesterResponseTemplate } from '../../../src/app/core/models/templates/tester-response-template.model';

import {
  TEAM_RESPONSE_MULTIPLE_DISAGREEMENT,
  TEAM_RESPONSE_SEVERITY_DISAGREEMENT,
  TEAM_RESPONSE_TYPE_DISAGREEMENT
} from '../../constants/githubcomment.constants';

const SEVERITY_LOW = 'Low';
const TYPE_DOCUMENTATION_BUG = 'DocumentationBug';

describe('TesterResponseTemplate class', () => {
  describe('teamChosenSeverity field', () => {
    it('creates the correct teamChosenSeverity value', () => {
      const template = new TesterResponseTemplate([TEAM_RESPONSE_SEVERITY_DISAGREEMENT]);

      expect(template.teamChosenSeverity).toBe(SEVERITY_LOW);
    });
  });
  describe('teamChosenType field', () => {
    it('creates the correct teamChosenType value', () => {
      const template = new TesterResponseTemplate([TEAM_RESPONSE_TYPE_DISAGREEMENT]);

      expect(template.teamChosenType).toBe(TYPE_DOCUMENTATION_BUG);
    });
  });
  describe('teamChosenType and teamChosenSeverity fields', () => {
    it('creates the correct teamChosenType adn teamchosenSeverity values', () => {
      const template = new TesterResponseTemplate([TEAM_RESPONSE_MULTIPLE_DISAGREEMENT]);

      expect(template.teamChosenSeverity).toBe(SEVERITY_LOW);
      expect(template.teamChosenType).toBe(TYPE_DOCUMENTATION_BUG);
    });
  });
});
