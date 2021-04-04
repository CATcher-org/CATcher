import { Profile } from '../../src/app/core/models/profile.model';
import { ProfileService } from '../../src/app/core/services/profile.service';

let profileService: any;

const EMPTY_PROFILES = [];
const VALID_PROFILES = [
  <Profile>{
    profileName: 'CATcher',
    encodedText: 'CATcher-org/public_data'
  }
];
const INVALID_PROFILES = [
  {
    profileName: 'CATcher'
  }
];

/**
 * Stub to mock the fetch API Call which retrieves the profiles
 * from the external repository.
 */
class PromiseStub extends Promise<Response> {
  readonly profiles: Object[];
  constructor(profiles: Object[]) {
    super(null);
    this.profiles = profiles;
  }

  /**
   * Overridden function to pass on the profiles as a Promise for the next step
   * in fetchExternalProfiles
   * @returns the json object with the given profiles.
   */
  then(onfulfilled?: (value: Response) => any, onrejected?: (reason: any) => PromiseLike<never>): Promise<any> {
    return Promise.resolve({
      profiles: this.profiles
    });
  }
}

describe('ProfileService', () => {
  beforeEach(() => {
    profileService = new ProfileService();
  });

  describe('.fetchExternalProfiles()', () => {
    it('should return the set of profiles if no profiles are given', () => {
      spyOn(window, 'fetch').and.returnValue(new PromiseStub(EMPTY_PROFILES));
      profileService.fetchExternalProfiles().then((profiles) => expect(profiles).toEqual(EMPTY_PROFILES));
    });

    it('should return the set of profiles if a set of valid profiles are given', () => {
      spyOn(window, 'fetch').and.returnValue(new PromiseStub(VALID_PROFILES));
      profileService.fetchExternalProfiles().then((profiles) => expect(profiles).toEqual(VALID_PROFILES));
    });

    it('should return the set of profiles if a set of valid profiles are given', () => {
      spyOn(window, 'fetch').and.returnValue(new PromiseStub(INVALID_PROFILES));
      profileService.fetchExternalProfiles().catch((error: Error) => expect(error.message).toEqual('profiles.json is malformed'));
    });
  });
});
