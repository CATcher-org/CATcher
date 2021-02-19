import { LabelService } from '../../src/app/core/services/label.service';
import { Label } from '../../src/app/core/models/label.model';
import * as LabelConstant from '../constants/label.constants';
import { Observable, of } from 'rxjs';

let labelService: LabelService;
let labelList: Label[];
let githubService: any;

describe('LabelService', () => {
    beforeEach(() => {
      githubService = jasmine.createSpyObj('GithubService', ['fetchAllLabels', 'createLabel']);
      labelService = new LabelService(githubService);
    });

    describe('.syncLabels()', () => {
      it('should return the result of labelService.synchronizeRemoteLabels()', () => {
        githubService.fetchAllLabels.and.callFake(() => of([]));
        githubService.createLabel.and.callFake(() => {});
        of(true)
          .pipe(labelService.syncLabels())
          .subscribe((obcservable: Observable<any>) => obcservable.subscribe(
            (result: {}[]) => expect(result).toEqual([])
          ));
      });
    });
});

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
        expect(labelService.isDarkColor(LabelConstant.COLOR_BLACK)).toBeTruthy();
    });

    it('should be false for light color', () => {
        expect(labelService.isDarkColor(LabelConstant.COLOR_WHITE)).toBeFalsy();
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
        expect(labelService.setLabelStyle(LabelConstant.COLOR_BLACK))
            .toEqual(LabelConstant.DARK_BG_LIGHT_TEXT);
    });

    it('should be light color background with dark color text', () => {
        expect(labelService.setLabelStyle(LabelConstant.COLOR_WHITE))
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

    it('should be white color for invalid inputs', () => {
        expect(labelService.getColorOfLabel(null))
            .toEqual(LabelConstant.COLOR_WHITE.toLowerCase());
    });
});
