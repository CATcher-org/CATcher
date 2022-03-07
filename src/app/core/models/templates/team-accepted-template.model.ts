import { GithubComment } from '../github/github-comment.model';
import { Header, Template } from './template.model';

const { endOfInput, sequenceOf, startOfInput, str } = require('arcsecond');

export const TeamAcceptedMessage = 'Your response not required for this bug as the team has accepted the bug as it is.';
export const TeamAcceptedHeader = { teamAccepted: new Header(TeamAcceptedMessage, 0) };

const TeamAcceptedParser = sequenceOf([startOfInput, str(TeamAcceptedMessage), endOfInput]);

export class TeamAcceptedTemplate extends Template {
  teamAccepted?: boolean;

  constructor(githubIssueComments: GithubComment[]) {
    super(TeamAcceptedParser, Object.values(TeamAcceptedHeader));

    const teamAcceptedComment = githubIssueComments.find((comment) => this.test(comment.body));

    if (teamAcceptedComment === undefined) {
      return;
    }

    this.teamAccepted = true;
  }
}
