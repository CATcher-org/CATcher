import { isValidProfile, Profile } from '../../src/app/core/models/profile.model';

describe('isValidProfile', () => {
  it('returns false for a profile with no repoName field', () => {
    const profile = { profileName: 'CATcher-org' };
    expect(isValidProfile(profile as Profile)).toBe(false);
  });

  it('returns false for a profile with an empty repoName field', () => {
    const profile = { profileName: 'CATcher-org', repoName: '' };
    expect(isValidProfile(profile as Profile)).toBe(false);
  });

  it('returns false for a profile with a malformed repoName field', () => {
    const profile = { profileName: 'CATcher-org', repoName: 'somestring' };
    expect(isValidProfile(profile as Profile)).toBe(false);
  });

  it('returns false for a profile with no profileName field', () => {
    const profile = { repoName: 'public' };
    expect(isValidProfile(profile as Profile)).toBe(false);
  });

  it('returns false for a profile with an empty profileName field', () => {
    const profile = { profileName: '', repoName: 'public' };
    expect(isValidProfile(profile as Profile)).toBe(false);
  });

  it('returns true for a valid profile with profileName and repoName fields', () => {
    const profile = { profileName: 'CATcher-org', repoName: 'CATcher/public' };
    expect(isValidProfile(profile as Profile)).toBe(true);
  });
});
