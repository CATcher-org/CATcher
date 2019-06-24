import { LabelService } from '../../src/app/core/services/label.service';

let labelService: LabelService;
// Label constants
const SEVERITY_LOW = 'Low';
const SEVERITY_MEDIUM = 'Medium';
const SEVERITY_HIGH = 'High';
const TYPE_DOCUMENTATION_BUG = 'DocumentationBug';
const TYPE_FUNCTIONALITY_BUG = 'FunctionalityBug';
const RESPONSE_ACCEPTED = 'Accepted';
const RESPONSE_REJECTED = 'Rejected';
const RESPONSE_ISSUE_UNCLEAR = 'IssueUnclear';
const RESPONSE_CANNOT_REPRODUCE = 'CannotReproduce';
const STATUS_DONE = 'Done';
const STATUS_INCOMPLETE = 'Incomplete';

// Color constants
const COLOR_DARK  = '000000';
const COLOR_LIGHT  = 'FFFFFF';
const COLOR_SEVERITY_LOW = 'ffb3b3';
const COLOR_SEVERITY_MEDIUM = 'ff6666';
const COLOR_SEVERITY_HIGH = 'b30000';
const COLOR_TYPE_DOCUMENTATION_BUG = 'ccb3ff';
const COLOR_TYPE_FUNCTIONALITY_BUG = '661aff';
const COLOR_RESPONSE_ACCEPTED = '80ffcc';
const COLOR_RESPONSE_REJECTED = 'ff80b3';
const COLOR_RESPONSE_ISSUE_UNCLEAR = 'ffcc80';
const COLOR_RESPONSE_CANNOT_REPRODUCE = 'bfbfbf';
const COLOR_STATUS_DONE = 'b3ecff';
const COLOR_STATUS_INCOMPLETE = '1ac6ff';

// CSS style constants
const DARK_BG_LIGHT_TEXT = {
    'background-color' : `#${COLOR_DARK}`,
    'border-radius' : '3px',
    'padding' : '3px',
    'color' : `#${COLOR_LIGHT}`,
    'font-weight' : '410',
};
const LIGHT_BG_DARK_TEXT = {
    'background-color' : `#${COLOR_LIGHT}`,
    'border-radius' : '3px',
    'padding' : '3px',
    'color' : `#${COLOR_DARK}`,
    'font-weight' : '410',
};

describe('LabelService: isDarkColor()', () => {
    beforeEach(() => {
        labelService = new LabelService(null);
    });

    afterEach(() => {
        labelService = null;
    });

    it('should be true for dark color', () => {
        expect(labelService.isDarkColor(COLOR_DARK)).toBeTruthy();
    });

    it('should be false for light color', () => {
        expect(labelService.isDarkColor(COLOR_LIGHT)).toBeFalsy();
    });
});

describe('LabelService: setLabelStyle()', () => {
    beforeEach(() => {
        labelService = new LabelService(null);
    });

    afterEach(() => {
        labelService = null;
    });

    it('should be dark color background with light color text', () => {
        expect(labelService.setLabelStyle(COLOR_DARK)).toEqual(DARK_BG_LIGHT_TEXT);
    });

    it('should be light color background with dark color text', () => {
        expect(labelService.setLabelStyle(COLOR_LIGHT)).toEqual(LIGHT_BG_DARK_TEXT);
    });
});

describe('LabelService: getColorOfLabel()', () => {
    beforeEach(() => {
        labelService = new LabelService(null);
    });

    afterEach(() => {
        labelService = null;
    });

    it('should be correct label color for Severity.Low', () => {
        expect(labelService.getColorOfLabel(SEVERITY_LOW)).toEqual(COLOR_SEVERITY_LOW);
    });

    it('should be correct label color for Severity.Medium', () => {
        expect(labelService.getColorOfLabel(SEVERITY_MEDIUM)).toEqual(COLOR_SEVERITY_MEDIUM);
    });

    it('should be correct label color for Severity.High', () => {
        expect(labelService.getColorOfLabel(SEVERITY_HIGH)).toEqual(COLOR_SEVERITY_HIGH);
    });

    it('should be correct label color for Documentation.Bug', () => {
        expect(labelService.getColorOfLabel(TYPE_DOCUMENTATION_BUG)).toEqual(COLOR_TYPE_DOCUMENTATION_BUG);
    });

    it('should be correct label color for Functionality.Bug', () => {
        expect(labelService.getColorOfLabel(TYPE_FUNCTIONALITY_BUG)).toEqual(COLOR_TYPE_FUNCTIONALITY_BUG);
    });

    it('should be correct label color for Response.Accepted', () => {
        expect(labelService.getColorOfLabel(RESPONSE_ACCEPTED)).toEqual(COLOR_RESPONSE_ACCEPTED);
    });

    it('should be correct label color for Response.Rejected', () => {
        expect(labelService.getColorOfLabel(RESPONSE_REJECTED)).toEqual(COLOR_RESPONSE_REJECTED);
    });

    it('should be correct label color for Response.IssueUnclear', () => {
        expect(labelService.getColorOfLabel(RESPONSE_ISSUE_UNCLEAR)).toEqual(COLOR_RESPONSE_ISSUE_UNCLEAR);
    });

    it('should be correct label color for Response.CannotReproduce', () => {
        expect(labelService.getColorOfLabel(RESPONSE_CANNOT_REPRODUCE)).toEqual(COLOR_RESPONSE_CANNOT_REPRODUCE);
    });

    it('should be correct label color for Status.Done', () => {
        expect(labelService.getColorOfLabel(STATUS_DONE)).toEqual(COLOR_STATUS_DONE);
    });

    it('should be correct label color for Status.Incomplete', () => {
        expect(labelService.getColorOfLabel(STATUS_INCOMPLETE)).toEqual(COLOR_STATUS_INCOMPLETE);
    });
});
