import { ApplicationService } from '../../src/app/core/services/application.service';

const upToDateAppService = new ApplicationService(null);
const currentVersion = '3.2.5';

class ApplicationServiceStub extends ApplicationService {
  readonly currentVersion: string;
  constructor(latestVersion: string, currentVersion: string) {
    super(null);
    this.latestVersion = latestVersion;
    this.currentVersion = currentVersion;
  }
}

describe('Test for ApplicationService#isApplicationOutdated', () => {
  it('should return an Observable of false if the ApplicationService is outdated', () => {
    const outdatedAppService1 = new ApplicationServiceStub('2.2.5', currentVersion);
    outdatedAppService1.isApplicationOutdated().subscribe((bool) => expect(bool).toBe(false));
    const outdatedAppService2 = new ApplicationServiceStub('3.1', currentVersion);
    outdatedAppService2.isApplicationOutdated().subscribe((bool) => expect(bool).toBe(false));
    const outdatedAppService3 = new ApplicationServiceStub('3.2.4', currentVersion);
    outdatedAppService3.isApplicationOutdated().subscribe((bool) => expect(bool).toBe(false));
    const longVersionedAppService = new ApplicationServiceStub('3.2.4.8.9', currentVersion);
    longVersionedAppService.isApplicationOutdated().subscribe((bool) => expect(bool).toBe(false));
    const latestApplicationService = new ApplicationServiceStub(currentVersion, currentVersion);
    latestApplicationService.isApplicationOutdated().subscribe((bool) => expect(bool).toBe(false));
  });

  it('should return an Observable of true if the ApplicationService is up to date', () => {
    const upToDateAppService1 = new ApplicationServiceStub('3.2.5.0', currentVersion);
    upToDateAppService1.isApplicationOutdated().subscribe((bool) => expect(bool).toBe(true));
    const upToDateAppService2 = new ApplicationServiceStub('3.2.5.5', currentVersion);
    upToDateAppService2.isApplicationOutdated().subscribe((bool) => expect(bool).toBe(true));
    const upToDateAppService3 = new ApplicationServiceStub('3.2.6', currentVersion);
    upToDateAppService3.isApplicationOutdated().subscribe((bool) => expect(bool).toBe(true));
    const upToDateAppService4 = new ApplicationServiceStub('3.2.6', currentVersion);
    upToDateAppService4.isApplicationOutdated().subscribe((bool) => expect(bool).toBe(true));
  });
});
