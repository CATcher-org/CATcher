import { Label } from '../../src/app/core/models/label.model';
import { LabelService } from '../../src/app/core/services/label.service';

// Label name constants
export const SEVERITY_VERY_LOW = 'Very Low';
export const SEVERITY_LOW = 'Low';
export const SEVERITY_MEDIUM = 'Medium';
export const SEVERITY_HIGH = 'High';
export const TYPE_DOCUMENTATION_BUG = 'DocumentationBug';
export const TYPE_FUNCTIONALITY_BUG = 'FunctionalityBug';
export const TYPE_FEATURE_FLAW = 'FeatureFlaw';
export const RESPONSE_ACCEPTED = 'Accepted';
export const RESPONSE_REJECTED = 'Rejected';
export const RESPONSE_ISSUE_UNCLEAR = 'IssueUnclear';
export const RESPONSE_CANNOT_REPRODUCE = 'CannotReproduce';
export const STATUS_DONE = 'Done';
export const STATUS_INCOMPLETE = 'Incomplete';

// Label category constants
export const SEVERITY = 'severity';
export const TYPE = 'type';
export const RESPONSE = 'response';
export const STATUS = 'status';

// Label definition
export const DEFINITION_UNDEFINIED = null;
export const DEFINITION_SEVERITY_VERY_LOW =
  '<p>A flaw that is <mark>purely cosmetic</mark> and <mark>does not ' +
  'affect usage</mark>. For example, ' +
  '<ul>' +
  '<li>a typo issues</li>' +
  '<li>spacing issues</li>' +
  '<li>layout issues</li>' +
  '<li>color issues</li>' +
  '<li>font issues</li>' +
  '</ul>' +
  "in the docs or the UI that doesn't affect usage.</p>";
export const DEFINITION_SEVERITY_LOW =
  '<p>A flaw that is unlikely to affect normal operations of the product. ' +
  'Appears only in very rare situations and causes a minor inconvenience only.</p>';
export const DEFINITION_SEVERITY_MEDIUM =
  '<p>A flaw that causes occasional inconvenience to some users but they can ' + 'continue to use the product.</p>';
export const DEFINITION_SEVERITY_HIGH =
  '<p>A flaw that affects most users and causes major problems for users.' + 'i.e., makes the product almost unusable for most users.</p>';
export const DEFINITION_FUNCTIONALITY_BUG = '<p>A functionality does not work as specified/expected.</p>';
export const DEFINITION_FEATURE_FLAW =
  '<p>Some functionality missing from a feature delivered in the current version ' +
  'in a way that the feature becomes less useful to the intended target user for <i>normal</i> usage. ' +
  "i.e., the feature is not 'complete'.\nIn other words, an acceptance-testing bug that falls within " +
  'the scope of the current version features. These issues are counted against the <i>product design</i> aspect ' +
  'of the project.</p>';
export const DEFINITION_DOCUMENTATION_BUG =
  '<p>A flaw in the documentation ' + '<span style="color:grey;">e.g., a missing step, a wrong instruction, typos</span></p>';

// Label color constants
export const COLOR_BLACK = '000000';
export const COLOR_WHITE = 'FFFFFF';
export const COLOR_SEVERITY_VERY_LOW = 'ffe0e0';
export const COLOR_SEVERITY_LOW = 'ffcccc';
export const COLOR_SEVERITY_MEDIUM = 'ff9999';
export const COLOR_SEVERITY_HIGH = 'ff6666';
export const COLOR_TYPE_DOCUMENTATION_BUG = 'd966ff';
export const COLOR_TYPE_FUNCTIONALITY_BUG = '9900cc';
export const COLOR_RESPONSE_ACCEPTED = '00802b';
export const COLOR_RESPONSE_REJECTED = 'ff9900';
export const COLOR_RESPONSE_ISSUE_UNCLEAR = 'ffcc80';
export const COLOR_RESPONSE_CANNOT_REPRODUCE = 'ffebcc';
export const COLOR_STATUS_DONE = 'a6a6a6';
export const COLOR_STATUS_INCOMPLETE = '000000';

// CSS style constants
export const DARK_BG_LIGHT_TEXT = {
  'background-color': `#${COLOR_BLACK}`,
  'border-radius': '3px',
  cursor: 'default',
  padding: '3px',
  color: `#${COLOR_WHITE}`,
  'font-weight': '410',
  display: 'inline-flex'
};

export const LIGHT_BG_DARK_TEXT = {
  'background-color': `#${COLOR_WHITE}`,
  'border-radius': '3px',
  cursor: 'default',
  padding: '3px',
  color: `#${COLOR_BLACK}`,
  'font-weight': '410',
  display: 'inline-flex'
};

export const INLINE_BLOCK_TEXT = {
  'background-color': `#${COLOR_WHITE}`,
  'border-radius': '3px',
  cursor: 'default',
  padding: '3px',
  color: `#${COLOR_BLACK}`,
  'font-weight': '410',
  display: 'inline-block'
};

export const RESPONSE_REJECTED_LABEL = new Label(RESPONSE, RESPONSE_REJECTED, COLOR_RESPONSE_REJECTED);
export const STATUS_DONE_LABEL = new Label(STATUS, STATUS_DONE, COLOR_STATUS_DONE);

export const TYPE_DOCUMENTATION_BUG_LABEL = new Label(
  TYPE,
  TYPE_DOCUMENTATION_BUG,
  COLOR_TYPE_DOCUMENTATION_BUG,
  DEFINITION_DOCUMENTATION_BUG
);
export const TYPE_FUNCTIONALITY_BUG_LABEL = new Label(
  TYPE,
  TYPE_FUNCTIONALITY_BUG,
  COLOR_TYPE_FUNCTIONALITY_BUG,
  DEFINITION_FUNCTIONALITY_BUG
);

export const SEVERITY_HIGH_LABEL = new Label(SEVERITY, SEVERITY_HIGH, COLOR_SEVERITY_HIGH, DEFINITION_SEVERITY_HIGH);
export const SEVERITY_MEDIUM_LABEL = new Label(SEVERITY, SEVERITY_MEDIUM, COLOR_SEVERITY_MEDIUM, DEFINITION_SEVERITY_MEDIUM);
export const SEVERITY_LOW_LABEL = new Label(SEVERITY, SEVERITY_LOW, COLOR_SEVERITY_LOW, DEFINITION_SEVERITY_LOW);

// Constant array of labels for team response phase and moderation phase to simulate Github response
export const SOME_TEAM_RESPONSE_PHASE_LABELS = [
  {
    color: COLOR_RESPONSE_ACCEPTED,
    name: RESPONSE + '.' + RESPONSE_ACCEPTED
  },
  {
    color: COLOR_SEVERITY_LOW,
    name: SEVERITY + '.' + SEVERITY_LOW,
    definition: DEFINITION_SEVERITY_LOW
  },
  {
    color: COLOR_TYPE_FUNCTIONALITY_BUG,
    name: TYPE + '.' + TYPE_FUNCTIONALITY_BUG,
    definition: DEFINITION_FUNCTIONALITY_BUG
  }
];

// Constant array of labels for tester phase to simulate Github response
export const SOME_TESTER_PHASE_LABELS = [
  {
    color: COLOR_SEVERITY_HIGH,
    name: SEVERITY + '.' + SEVERITY_HIGH
  },
  {
    color: COLOR_TYPE_DOCUMENTATION_BUG,
    name: TYPE + '.' + TYPE_DOCUMENTATION_BUG
  }
];

export const ALL_REQUIRED_LABELS_ARRAY: {}[] = LabelService.getRequiredLabelsAsArray(true).map((label: Label) => {
  return {
    color: label.labelColor,
    name: label.getFormattedName()
  };
});

// List of labels
export const SEVERITY_LABELS = [
  new Label(SEVERITY, SEVERITY_LOW, COLOR_SEVERITY_LOW, DEFINITION_SEVERITY_LOW),
  new Label(SEVERITY, SEVERITY_MEDIUM, COLOR_SEVERITY_MEDIUM, DEFINITION_SEVERITY_MEDIUM),
  new Label(SEVERITY, SEVERITY_HIGH, COLOR_SEVERITY_HIGH, DEFINITION_SEVERITY_HIGH)
];
