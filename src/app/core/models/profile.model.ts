import { Schema, isValidObject } from '../../shared/lib/validate';

/**
 * Indicates all the elements that make up a Profile.
 */
export interface Profile {
  profileName: string;
  encodedText: string;
}

/**
 * Schema for validating profiles.json entries
 *
 * Profile must have a profileName and encodedText field,
 * both of which cannot be empty strings.
 */

const profileSchema: Schema = {
  profileName: { required: true, validate: (value) => !!value },
  encodedText: { required: true, validate: (value) => !!value }
};

export const isValidProfile = (profile: Profile) => isValidObject(profile, profileSchema);
