import { GithubComment } from '../github/github-comment.model';
import { Template } from './template.model';

const { endOfInput, sequenceOf, startOfInput, str } = require('arcsecond');

export const TeamAcceptedMessage = 'Your response not required for this bug as the team has accepted the bug as it is.';

const TeamAcceptedParser = sequenceOf([startOfInput, str(TeamAcceptedMessage), endOfInput]);

export class TeamAcceptedTemplate extends Template {
  teamAccepted?: boolean;

  constructor(githubComments: GithubComment[]) {
    super(TeamAcceptedParser);

    this.findConformingComment(githubComments);

    if (this.parseFailure) {
      return;
    }

    this.teamAccepted = true;
  }
}
