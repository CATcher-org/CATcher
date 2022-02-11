import { GithubComment } from '../github/github-comment.model';
import { Header, Template } from './template.model';

const TeamAcceptedRegexString = 'response not required for this bug as the team has accepted the bug as it';
export const TeamAcceptedMessage = 'Your ' + TeamAcceptedRegexString + ' is.';
export const TeamAcceptedHeader = { teamAccepted: new Header(TeamAcceptedRegexString, 0) };

export class TeamAcceptedTemplate extends Template {
  teamAccepted?: boolean;

  constructor(githubIssueComments: GithubComment[]) {
    super(Object.values(TeamAcceptedHeader));

    const teamAcceptedComment = githubIssueComments.find((comment) => this.test(comment.body));

    if (teamAcceptedComment === undefined) {
      return;
    }

    this.teamAccepted = true;
  }
}
