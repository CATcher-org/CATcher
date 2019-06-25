// Label constants
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

// Color constants
export const COLOR_DARK  = '000000';
export const COLOR_LIGHT  = 'FFFFFF';
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
    'background-color' : `#${COLOR_DARK}`,
    'border-radius' : '3px',
    'padding' : '3px',
    'color' : `#${COLOR_LIGHT}`,
    'font-weight' : '410',
};
export const LIGHT_BG_DARK_TEXT = {
    'background-color' : `#${COLOR_LIGHT}`,
    'border-radius' : '3px',
    'padding' : '3px',
    'color' : `#${COLOR_DARK}`,
    'font-weight' : '410',
};
