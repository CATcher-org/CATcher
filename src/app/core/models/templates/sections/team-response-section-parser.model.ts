const { coroutine, everyCharUntil, str, whitespace } = require('arcsecond');

const TEAM_RESPONSE_HEADER = "# Team's Response";

export function buildTeamResponseSectionParser(nextHeader: string) {
  return coroutine(function* () {
    yield str(TEAM_RESPONSE_HEADER);
    yield whitespace;
    const teamResponse = yield everyCharUntil(str(nextHeader));

    return teamResponse.trim();
  });
}
