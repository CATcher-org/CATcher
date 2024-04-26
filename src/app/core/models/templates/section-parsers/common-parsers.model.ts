const { char, choice, coroutine, everyCharUntil, str, whitespace } = require('arcsecond');

const TEAM_RESPONSE_HEADER = "# Team's Response";
const DEFAULT_TEAM_RESPONSE = 'No details provided by team.';

/**
 * Builds a parser for the team response section.
 * Team response sections appear in both the Team Response and Tester Response comment templates.
 * The format of the Team Response section is as follows
 * # Team's response
 *
 * { team's response }
 *
 * { next header }
 *
 * A concrete example would be:
 *
 * # Team's response
 *
 * This not a bug, it's a feature
 *
 * ## Duplicate status (if any):
 *
 * This parser works by reading everything in between the Team's reponse header and the next header.
 * The reason why this parser builder exists is because the next header is different in both comment templates.
 * The next header in the Team Response comment is ## Duplicate status (if any):
 * While the next header in the Tester Response comment is # Disputes
 * @param nextHeader
 * @returns a string containing the team response
 */
export function buildTeamResponseSectionParser(nextHeader: string) {
  return coroutine(function* () {
    yield str(TEAM_RESPONSE_HEADER);
    yield whitespace;
    const teamResponse = yield everyCharUntil(str(nextHeader));
    return teamResponse.trim() ? teamResponse.trim() : DEFAULT_TEAM_RESPONSE;
  });
}

/**
 * Parses the checkbox and returns whether it is filled or not.
 * Filled checkboxes look like this: - [x] { description }, e.g. - [x] I disagree
 * Unfilled checkboxes look like thsi: - [ ] { description }
 * @param description
 * @returns true if the checkbox is filled, false otherwise
 */
export function buildCheckboxParser(description: string) {
  return coroutine(function* () {
    yield str('- [');
    const checkbox = yield choice([char('x'), whitespace]);
    yield str('] ' + description);

    return checkbox === 'x';
  });
}
