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
 */

const profileSchema: Schema = {
  profileName: { required: true, validate: (value) => !!value },
  encodedText: { required: true, validate: (value) => !!value }
};

export const isValidProfile = (profile: Profile) => isValidObject(profile, profileSchema);
