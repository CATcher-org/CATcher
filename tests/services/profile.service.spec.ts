import { Profile } from '../../src/app/core/models/profile.model';
import { GithubService } from '../../src/app/core/services/github.service';
import { ProfileService } from '../../src/app/core/services/profile.service';

let githubService: GithubService;
let profileService: ProfileService;

const EMPTY_PROFILES = [];
const VALID_PROFILES = [
  <Profile>{
    profileName: 'CATcher',
    repoName: 'CATcher-org/public_data'
  }
];
const INVALID_PROFILES = [
  {
    profileName: 'CATcher'
  }
];

describe('ProfileService', () => {
  beforeEach(() => {
    githubService = new GithubService(null, null, null, null);
    profileService = new ProfileService(githubService);
  });

  describe('.fetchExternalProfiles()', () => {
    it('should return an empty array if no profiles are given', () => {
      spyOn(window, 'fetch').and.returnValue(generateProfilesPromise(EMPTY_PROFILES));
      return profileService.fetchExternalProfiles().then((profiles) => expect(profiles).toEqual(EMPTY_PROFILES));
    });

    it('should return the set of profiles if a set of valid profiles is given', () => {
      spyOn(window, 'fetch').and.returnValue(generateProfilesPromise(VALID_PROFILES));
      return profileService.fetchExternalProfiles().then((profiles) => expect(profiles).toEqual(VALID_PROFILES));
    });

    it('should throw an error if a set of invalid profiles is given', () => {
      spyOn(window, 'fetch').and.returnValue(generateProfilesPromise(INVALID_PROFILES));
      return profileService
        .fetchExternalProfiles()
        .then(() => fail())
        .catch((error: Error) => expect(error.message).toEqual('profiles.json is malformed'));
    });
  });
});

function generateProfilesPromise(profiles: any[]): Promise<Response> {
  const mockResponse: Response = { json: () => Promise.resolve({ profiles: profiles }) } as Response;
  return Promise.resolve(mockResponse);
}
