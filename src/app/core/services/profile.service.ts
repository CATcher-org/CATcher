import { AppConfig } from '../../../environments/environment';
import { isValidProfile, Profile } from '../models/profile.model';

export class ProfileService {
  constructor() { }

  /**
   * Gets the required profiles from the external repository file.
   */
  public fetchExternalProfiles(): Promise<Profile[]> {
    return fetch(AppConfig.clientDataUrl)
      .then(res => res.json())
      .then(json => json.profiles || [])
      .then(profiles => {
        if (!profiles.every(isValidProfile)) {
          throw new Error('profiles.json is malformed');
        }
        return profiles;
      });
  }
}
