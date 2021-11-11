import { isValidObject, Schema } from '../../shared/lib/validate';

/**
 * Indicates all the elements that make up a Profile.
 */
export interface Profile {
  profileName: string;
  repoName: string;
}

/**
 * Schema for validating profiles.json entries
 *
 * Profile must have a profileName and repoName field,
 * both of which cannot be empty strings.
 */

const profileSchema: Schema = {
  profileName: { required: true, validate: (value: string) => !!value },
  repoName: { required: true, validate: (value: string) => !!value.match(/\w+\/\w+/g) } // match strings of the form : string/string
};

export const isValidProfile = (profile: Profile) => isValidObject(profile, profileSchema);
