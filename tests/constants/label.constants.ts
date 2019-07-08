// Label name constants
export const SEVERITY_LOW = 'Low';
export const SEVERITY_MEDIUM = 'Medium';
export const SEVERITY_HIGH = 'High';
export const TYPE_DOCUMENTATION_BUG = 'DocumentationBug';
export const TYPE_FUNCTIONALITY_BUG = 'FunctionalityBug';
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
export const COLOR_BLACK  = '000000';
export const COLOR_WHITE  = 'FFFFFF';
export const COLOR_SEVERITY_LOW = 'ffb3b3';
export const COLOR_SEVERITY_MEDIUM = 'ff6666';
export const COLOR_SEVERITY_HIGH = 'b30000';
export const COLOR_TYPE_DOCUMENTATION_BUG = 'ccb3ff';
export const COLOR_TYPE_FUNCTIONALITY_BUG = '661aff';
export const COLOR_RESPONSE_ACCEPTED = '80ffcc';
export const COLOR_RESPONSE_REJECTED = 'ff80b3';
export const COLOR_RESPONSE_ISSUE_UNCLEAR = 'ffcc80';
export const COLOR_RESPONSE_CANNOT_REPRODUCE = 'bfbfbf';
export const COLOR_STATUS_DONE = 'b3ecff';
export const COLOR_STATUS_INCOMPLETE = '1ac6ff';

// CSS style constants
export const DARK_BG_LIGHT_TEXT = {
    'background-color' : `#${COLOR_BLACK}`,
    'border-radius' : '3px',
    'cursor' : 'default',
    'padding' : '3px',
    'color' : `#${COLOR_WHITE}`,
    'font-weight' : '410',
};

export const LIGHT_BG_DARK_TEXT = {
    'background-color' : `#${COLOR_WHITE}`,
    'border-radius' : '3px',
    'cursor' : 'default',
    'padding' : '3px',
    'color' : `#${COLOR_BLACK}`,
    'font-weight' : '410',
};

// Constant array of labels to simulate Github response
export const LABEL_ARRAY = [
    {
        color: COLOR_RESPONSE_ACCEPTED,
        name: RESPONSE + '.' + RESPONSE_ACCEPTED
    },
    {
        color: COLOR_SEVERITY_LOW,
        name: SEVERITY + '.' + SEVERITY_LOW
    },
    {
        color: COLOR_TYPE_FUNCTIONALITY_BUG,
        name: TYPE + '.' + TYPE_FUNCTIONALITY_BUG
    }
];
