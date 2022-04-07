const { char, choice, coroutine, everyCharUntil, str, whitespace } = require('arcsecond');

const TEAM_RESPONSE_HEADER = "# Team's Response";
const DEFAULT_TEAM_RESPONSE = 'No details provided by team.';

export function buildTeamResponseSectionParser(nextHeader: string) {
  return coroutine(function* () {
    yield str(TEAM_RESPONSE_HEADER);
    yield whitespace;
    const teamResponse = yield everyCharUntil(str(nextHeader));
    return teamResponse.trim() ? teamResponse.trim() : DEFAULT_TEAM_RESPONSE;
  });
}

export function buildCheckboxParser(description: string) {
  return coroutine(function* () {
    yield str('- [');
    const checkbox = yield choice([char('x'), whitespace]);
    yield str('] ' + description);

    return checkbox === 'x';
  });
}
