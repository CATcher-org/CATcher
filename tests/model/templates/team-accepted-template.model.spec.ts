import { GithubComment } from '../../../src/app/core/models/github/github-comment.model';
import { TeamAcceptedMessage, TeamAcceptedTemplate } from '../../../src/app/core/models/templates/team-accepted-template.model';

import { TEAM_RESPONSE_MULTIPLE_DISAGREEMENT } from '../../constants/githubcomment.constants';

const EMPTY_BODY_GITHUB_COMMENT = {
  body: ''
} as GithubComment;

const ACCEPTED_MESSAGE_GITHUB_COMMENT = {
  body: TeamAcceptedMessage
} as GithubComment;

const hasAcceptedComment = [EMPTY_BODY_GITHUB_COMMENT, ACCEPTED_MESSAGE_GITHUB_COMMENT];
const noAcceptedComment = [EMPTY_BODY_GITHUB_COMMENT, TEAM_RESPONSE_MULTIPLE_DISAGREEMENT];

describe('TeamAcceptedTemplate class', () => {
  it('parses team accepted message correctly', () => {
    const template = new TeamAcceptedTemplate([ACCEPTED_MESSAGE_GITHUB_COMMENT]);

    expect(template.teamAccepted).toBe(true);
  });
  it('finds team accepted comment correctly', () => {
    const template = new TeamAcceptedTemplate(hasAcceptedComment);

    expect(template.teamAccepted).toBe(true);
  });
  it('does not find team accepted comment', () => {
    const template = new TeamAcceptedTemplate(noAcceptedComment);

    expect(template.teamAccepted).not.toBe(true);
  });
});
