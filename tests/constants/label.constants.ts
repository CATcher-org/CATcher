import { Label } from '../../src/app/core/models/label.model';
import { LabelService, LABEL_DEFINITIONS } from '../../src/app/core/services/label.service';

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

export const RESPONSE_REJECTED_LABEL = new Label(RESPONSE, RESPONSE_REJECTED, COLOR_RESPONSE_REJECTED, LABEL_DEFINITIONS.responseRejected);
export const STATUS_DONE_LABEL = new Label(STATUS, STATUS_DONE, COLOR_STATUS_DONE);

export const TYPE_DOCUMENTATION_BUG_LABEL = new Label(
  TYPE,
  TYPE_DOCUMENTATION_BUG,
  COLOR_TYPE_DOCUMENTATION_BUG,
  LABEL_DEFINITIONS.typeDocumentationBug
);
export const TYPE_FUNCTIONALITY_BUG_LABEL = new Label(
  TYPE,
  TYPE_FUNCTIONALITY_BUG,
  COLOR_TYPE_FUNCTIONALITY_BUG,
  LABEL_DEFINITIONS.typeFunctionalityBug
);

export const SEVERITY_HIGH_LABEL = new Label(SEVERITY, SEVERITY_HIGH, COLOR_SEVERITY_HIGH, LABEL_DEFINITIONS.severityHigh);
export const SEVERITY_MEDIUM_LABEL = new Label(SEVERITY, SEVERITY_MEDIUM, COLOR_SEVERITY_MEDIUM, LABEL_DEFINITIONS.severityMedium);
export const SEVERITY_LOW_LABEL = new Label(SEVERITY, SEVERITY_LOW, COLOR_SEVERITY_LOW, LABEL_DEFINITIONS.severityLow);

// Constant array of labels for team response phase and moderation phase to simulate Github response
export const SOME_TEAM_RESPONSE_PHASE_LABELS = [
  {
    color: COLOR_RESPONSE_ACCEPTED,
    name: RESPONSE + '.' + RESPONSE_ACCEPTED,
    definition: LABEL_DEFINITIONS.responseAccepted
  },
  {
    color: COLOR_SEVERITY_LOW,
    name: SEVERITY + '.' + SEVERITY_LOW,
    definition: LABEL_DEFINITIONS.severityLow
  },
  {
    color: COLOR_TYPE_FUNCTIONALITY_BUG,
    name: TYPE + '.' + TYPE_FUNCTIONALITY_BUG,
    definition: LABEL_DEFINITIONS.typeFunctionalityBug
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
  new Label(SEVERITY, SEVERITY_LOW, COLOR_SEVERITY_LOW, LABEL_DEFINITIONS.severityLow),
  new Label(SEVERITY, SEVERITY_MEDIUM, COLOR_SEVERITY_MEDIUM, LABEL_DEFINITIONS.severityMedium),
  new Label(SEVERITY, SEVERITY_HIGH, COLOR_SEVERITY_HIGH, LABEL_DEFINITIONS.undefined)
];
