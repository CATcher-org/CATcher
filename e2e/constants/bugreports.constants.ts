import { AppConfig } from '../../src/environments/environment.test';
import { BugReport } from '../page-objects/header.po';
import { BugResponse } from '../page-objects/teamResponse.po';

export const BUG_REPORT_1: BugReport = {
  title: 'The page fails to load when I try to access the new page.',
  body: 'Whenever I try to access the new page, the application hangs.',
  severityLabel: 'High',
  bugTypeLabel: 'FeatureFlaw'
};

export const BUG_REPORT_2: BugReport = {
  title: 'The font size is too small.',
  body: 'I cannot read the words on the screen!',
  severityLabel: 'Low',
  bugTypeLabel: 'FunctionalityBug'
};

export const BUG_REPORT_3: BugReport = {
  title: 'The documentation states that this feature is present, but it is not!',
  body: 'As stated in the title, this feature is missing from the application!',
  severityLabel: 'Low',
  bugTypeLabel: 'DocumentationBug'
};

export const BUG_RESPONSE_1: BugResponse = {
  body: `Hi, we see your issue! We are working on it, thanks for the report! We will assign ${AppConfig.username} to handle it!`,
  severityLabel: 'High',
  bugTypeLabel: 'FeatureFlaw',
  assignees: [AppConfig.username],
  responseLabel: 'Accepted'
};

export const BUG_RESPONSE_2: BugResponse = {
  body: "I'm afraid this was clearly mentioned in our documentation! Please look over it again!",
  severityLabel: 'High',
  bugTypeLabel: 'FeatureFlaw',
  assignees: [],
  responseLabel: 'Rejected'
};

export const BUG_RESPONSE_3: BugResponse = {
  body: 'This is the intended outcome. We will adjust the documentation accordingly.',
  severityLabel: 'Low',
  bugTypeLabel: 'DocumentationBug',
  assignees: [],
  responseLabel: 'Accepted'
};
