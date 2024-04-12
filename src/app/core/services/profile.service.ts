import { Injectable } from '@angular/core';
import { isValidProfile, Profile } from '../models/profile.model';
import { GithubService } from './github.service';

export const MALFORMED_PROFILES_ERROR: Error = new Error('profiles.json is malformed');

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  constructor(private githubService: GithubService) {}

  /**
   * Gets the required profiles from the external repository file.
   */
  public fetchExternalProfiles(): Promise<Profile[]> {
    return this.githubService
      .getProfilesData()
      .then((res) => res.json())
      .then((json) => json.profiles || [])
      .then((profiles) => {
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
