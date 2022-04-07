import { GithubComment } from '../github/github-comment.model';
import { Header, Template } from './template.model';

const { endOfInput, sequenceOf, startOfInput, str } = require('arcsecond');

export const TeamAcceptedMessage = 'Your response not required for this bug as the team has accepted the bug as it is.';
export const TeamAcceptedHeader = { teamAccepted: new Header(TeamAcceptedMessage, 0) };

const TeamAcceptedParser = sequenceOf([startOfInput, str(TeamAcceptedMessage), endOfInput]);

export class TeamAcceptedTemplate extends Template {
  teamAccepted?: boolean;

  constructor(githubComments: GithubComment[]) {
    super(TeamAcceptedParser, Object.values(TeamAcceptedHeader));

    this.findConformingComment(githubComments);

    if (this.parseFailure) {
      return;
    }

    this.teamAccepted = true;
  }
}
