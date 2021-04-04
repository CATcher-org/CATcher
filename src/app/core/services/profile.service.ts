import { AppConfig } from '../../../environments/environment';
import { isValidProfile, Profile } from '../models/profile.model';

export const MALFORMED_PROFILES_ERROR: Error = new Error('profiles.json is malformed');

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
        this.validateProfiles(profiles);
        return profiles;
      });
  }
  
  /**
   * Checks if the profiles supplied are valid. If not, 
   * throw an error. 
   * @param profiles the profiles supplied.
   */
  public validateProfiles(profiles: any): void {
    if (!profiles.every(isValidProfile)) {
      throw MALFORMED_PROFILES_ERROR;
    }
  }
}
