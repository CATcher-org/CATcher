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

describe('ProfileService', () => {
  beforeEach(() => {
    profileService = new ProfileService();
  });

  describe('.fetchExternalProfiles()', () => {
    it('should return the set of profiles if no profiles are given', () => {
      spyOn(window, 'fetch').and.returnValue(generateProfilesPromise(EMPTY_PROFILES));
      profileService.fetchExternalProfiles().then((profiles) => expect(profiles).toEqual(EMPTY_PROFILES));
    });

    it('should return the set of profiles if a set of valid profiles are given', () => {
      spyOn(window, 'fetch').and.returnValue(generateProfilesPromise(VALID_PROFILES));
      profileService.fetchExternalProfiles().then((profiles) => expect(profiles).toEqual(VALID_PROFILES));
    });

    it('should return the set of profiles if a set of valid profiles are given', () => {
      spyOn(window, 'fetch').and.returnValue(generateProfilesPromise(INVALID_PROFILES));
      profileService.fetchExternalProfiles().catch((error: Error) => expect(error.message).toEqual('profiles.json is malformed'));
    });
  });
});

function generateProfilesPromise(profiles: any[]): Promise<Response> {
  const mockResponse: Response = { json: () => Promise.resolve({ profiles: profiles }) } as Response;
  return Promise.resolve(mockResponse);
}
