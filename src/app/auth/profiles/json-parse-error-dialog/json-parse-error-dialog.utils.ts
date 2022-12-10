const JSON_PARSE_ERROR_MESSAGE = `The format of the "profiles.json" file is not as required.
You might not have included <code>profileName</code> and <code>repoName</code> keys.
Please refer to our User Guide for the correct format.`;

const DUPLICATE_PROFILE_ERROR_MESSAGE = `You have already provided this profile.`;

const PROFILE_ERRORS = {
  JSON_PARSE_ERROR: 'JSON_PARSE_ERROR',
  DUPLICATE_PROFILE_ERROR: 'DUPLICATE_PROFILE_ERROR'
} as const;

type PROFILE_ERRORS = typeof PROFILE_ERRORS[keyof typeof PROFILE_ERRORS];

const getErrorMessage = (profileError: PROFILE_ERRORS) => {
  switch (profileError) {
    case PROFILE_ERRORS.DUPLICATE_PROFILE_ERROR:
      return DUPLICATE_PROFILE_ERROR_MESSAGE;
    case PROFILE_ERRORS.DUPLICATE_PROFILE_ERROR:
    default:
      return JSON_PARSE_ERROR_MESSAGE;
  }
};

export { getErrorMessage, PROFILE_ERRORS };
