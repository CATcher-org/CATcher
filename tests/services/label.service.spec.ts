import { LabelService } from '../../src/app/core/services/label.service';
import { Label } from '../../src/app/core/models/label.model';
import * as LabelConstant from '../constants/label.constants';

let labelService: LabelService;
let labelList: Label[];

describe('LabelService: parseLabelData()', () => {
    beforeAll(() => {
        labelService = new LabelService(null);
        labelList = labelService.parseLabelData(LabelConstant.LABEL_ARRAY);
    });

    afterAll(() => {
        labelService = null;
    });

    it('should be response.Accepted label', () => {
        expect(labelList[0].labelCategory).toBe(LabelConstant.RESPONSE);
        expect(labelList[0].labelValue).toBe(LabelConstant.RESPONSE_ACCEPTED);
        expect(labelList[0].labelColor).toBe(LabelConstant.COLOR_RESPONSE_ACCEPTED);
    });

    it('should be severity.Low', () => {
        expect(labelList[1].labelCategory).toBe(LabelConstant.SEVERITY);
        expect(labelList[1].labelValue).toBe(LabelConstant.SEVERITY_LOW);
        expect(labelList[1].labelColor).toBe(LabelConstant.COLOR_SEVERITY_LOW);
    });

    it('should be type.FunctionalityBug', () => {
        expect(labelList[2].labelCategory).toBe(LabelConstant.TYPE);
        expect(labelList[2].labelValue).toBe(LabelConstant.TYPE_FUNCTIONALITY_BUG);
        expect(labelList[2].labelColor).toBe(LabelConstant.COLOR_TYPE_FUNCTIONALITY_BUG);
    });
});

describe('LabelService: isDarkColor()', () => {
    beforeEach(() => {
        labelService = new LabelService(null);
    });

    afterEach(() => {
        labelService = null;
    });

    it('should be true for dark color', () => {
        expect(labelService.isDarkColor(LabelConstant.COLOR_DARK)).toBeTruthy();
    });

    it('should be false for light color', () => {
        expect(labelService.isDarkColor(LabelConstant.COLOR_LIGHT)).toBeFalsy();
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
        expect(labelService.setLabelStyle(LabelConstant.COLOR_DARK))
            .toEqual(LabelConstant.DARK_BG_LIGHT_TEXT);
    });

    it('should be light color background with dark color text', () => {
        expect(labelService.setLabelStyle(LabelConstant.COLOR_LIGHT))
            .toEqual(LabelConstant.LIGHT_BG_DARK_TEXT);
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
        expect(labelService.getColorOfLabel(LabelConstant.SEVERITY_LOW))
            .toEqual(LabelConstant.COLOR_SEVERITY_LOW);
    });

    it('should be correct label color for Severity.Medium', () => {
        expect(labelService.getColorOfLabel(LabelConstant.SEVERITY_MEDIUM))
            .toEqual(LabelConstant.COLOR_SEVERITY_MEDIUM);
    });

    it('should be correct label color for Severity.High', () => {
        expect(labelService.getColorOfLabel(LabelConstant.SEVERITY_HIGH))
            .toEqual(LabelConstant.COLOR_SEVERITY_HIGH);
    });

    it('should be correct label color for Documentation.Bug', () => {
        expect(labelService.getColorOfLabel(LabelConstant.TYPE_DOCUMENTATION_BUG))
            .toEqual(LabelConstant.COLOR_TYPE_DOCUMENTATION_BUG);
    });

    it('should be correct label color for Functionality.Bug', () => {
        expect(labelService.getColorOfLabel(LabelConstant.TYPE_FUNCTIONALITY_BUG))
            .toEqual(LabelConstant.COLOR_TYPE_FUNCTIONALITY_BUG);
    });

    it('should be correct label color for Response.Accepted', () => {
        expect(labelService.getColorOfLabel(LabelConstant.RESPONSE_ACCEPTED))
            .toEqual(LabelConstant.COLOR_RESPONSE_ACCEPTED);
    });

    it('should be correct label color for Response.Rejected', () => {
        expect(labelService.getColorOfLabel(LabelConstant.RESPONSE_REJECTED))
            .toEqual(LabelConstant.COLOR_RESPONSE_REJECTED);
    });

    it('should be correct label color for Response.IssueUnclear', () => {
        expect(labelService.getColorOfLabel(LabelConstant.RESPONSE_ISSUE_UNCLEAR))
            .toEqual(LabelConstant.COLOR_RESPONSE_ISSUE_UNCLEAR);
    });

    it('should be correct label color for Response.CannotReproduce', () => {
        expect(labelService.getColorOfLabel(LabelConstant.RESPONSE_CANNOT_REPRODUCE))
            .toEqual(LabelConstant.COLOR_RESPONSE_CANNOT_REPRODUCE);
    });

    it('should be correct label color for Status.Done', () => {
        expect(labelService.getColorOfLabel(LabelConstant.STATUS_DONE))
            .toEqual(LabelConstant.COLOR_STATUS_DONE);
    });

    it('should be correct label color for Status.Incomplete', () => {
        expect(labelService.getColorOfLabel(LabelConstant.STATUS_INCOMPLETE))
            .toEqual(LabelConstant.COLOR_STATUS_INCOMPLETE);
    });
});
