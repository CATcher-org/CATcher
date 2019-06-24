import { LabelService } from '../../src/app/core/services/label.service';

let labelService: LabelService;
const COLOR_DARK  = '000000';
const COLOR_LIGHT  = 'FFFFFF';
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

    it('color should be dark color', () => {
      expect(labelService.isDarkColor(COLOR_DARK)).toEqual(true);
    });

    it('color should be light color', () => {
        expect(labelService.isDarkColor(COLOR_LIGHT)).toEqual(false);
    });
});

describe('LabelService: setLabelStyle()', () => {
    beforeEach(() => {
      labelService = new LabelService(null);
    });

    afterEach(() => {
        labelService = null;
    });

    it('style should be dark color background with light color text', () => {
        expect(labelService.setLabelStyle(COLOR_DARK)).toEqual(DARK_BG_LIGHT_TEXT);
    });

    it('style should be light color background with dark color text', () => {
        expect(labelService.setLabelStyle(COLOR_LIGHT)).toEqual(LIGHT_BG_DARK_TEXT);
    });
});
