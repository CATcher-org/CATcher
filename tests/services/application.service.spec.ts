import {ApplicationService} from '../../src/app/core/services/application.service';

let applicationService = new ApplicationService(null);
const currentVersion = '3.2.5';

describe('Test the ApplicationService', () => {
    it('Test whether the ApplicationService can detect outdated versions', () => {
        expect(applicationService.isOutdatedVersion('2.2.5', currentVersion)).toBe(false);
        expect(applicationService.isOutdatedVersion('3.1', currentVersion)).toBe(false);
        expect(applicationService.isOutdatedVersion('3.2.4', currentVersion)).toBe(false);
        expect(applicationService.isOutdatedVersion('3.2.4.8.9', currentVersion)).toBe(false);
        expect(applicationService.isOutdatedVersion(currentVersion, currentVersion)).toBe(false);
        expect(applicationService.isOutdatedVersion('3.2.5.0', currentVersion)).toBe(true);
        expect(applicationService.isOutdatedVersion('3.2.5.5', currentVersion)).toBe(true);
        expect(applicationService.isOutdatedVersion('3.2.6', currentVersion)).toBe(true);
        expect(applicationService.isOutdatedVersion('10', currentVersion)).toBe(true);
    });
});