import { GithubComment } from '../../src/app/core/models/github/github-comment.model';

export const EMPTY_TEAM_RESPONSE: GithubComment = {
  body: "# Team's Response\n" + '\n' + ' ## Duplicate status (if any):\n' + '--',
  created_at: '2020-02-16T18:31:38Z',
  id: 586737495,
  issue_url: 'https://api.github.com/repos/CATcher-org/pe-results/issues/91',
  updated_at: '2020-03-02T12:50:02Z',
  url: 'https://api.github.com/repos/CATcher-org/pe-results/issues/comments/586737495',
  user: {
    login: 'testathorStudent',
    id: 46639862,
    avatar_url: 'https://avatars3.githubusercontent.com/u/46639862?v=4',
    url: 'https://api.github.com/users/testathorStudent'
  }
};

// Type and severity disagreeement
export const TEAM_RESPONSE_MULTIPLE_DISAGREEMENT = {
  body:
    '[IMPORTANT!: Please do not edit or reply to this comment using the GitHub UI. You can respond to it using CATcher during the next phase of the PE]\n\n' +
    "# Team's Response\n" +
    'This is a dummy team response comment: ' +
    'Thanks for the feedback\n\n' +
    '# Items for the Tester to Verify\n\n' +
    '## :question: Issue severity\n\n' +
    'Team chose [`severity.Low`]\n' +
    'Originally [`severity.High`]\n\n' +
    '- [ ] I disagree\n\n' +
    '**Reason for disagreement:** [replace this with your reason]\n\n' +
    '<catcher-end-of-segment><hr>\n\n' +
    '## :question: Issue type\n\n' +
    'Team chose [`type.DocumentationBug`]\n' +
    'Originally [`type.FunctionalityBug`]\n\n' +
    '- [ ] I disagree\n\n' +
    '**Reason for disagreement:** [replace this with your reason]\n\n' +
    '<catcher-end-of-segment><hr>',
  created_at: '2021-06-29T17:15:11Z',
  id: 870774171,
  updated_at: '2021-06-29T17:15:11Z'
} as GithubComment;

export const PENDING_TUTOR_MODERATION: GithubComment = {
  body:
    '# Tutor Moderation\n\n' +
    '## :question: Issue Type\n\n- [x] Done\n\ntest\n\n<catcher-end-of-segment><hr>\n' +
    '## :question: Issue Severity\n\n- [ ] Done\n\n' +
    '[replace this with your explanation]\n\n<catcher-end-of-segment><hr>\n' +
    '## :question: Not Related Question\n\n- [ ] Done\n\n' +
    '[replace this with your explanation]\n\n<catcher-end-of-segment><hr>\n',
  created_at: '2020-08-15T06:39:24Z',
  id: 674357972,
  issue_url: 'https://api.github.com/repos/CATcher-org/pe-evaluation/issues/26',
  updated_at: '2020-08-15T06:39:40Z',
  url: 'https://api.github.com/repos/CATcher-org/pe-evaluation/issues/comments/674357972',
  user: {
    login: 'testathorTutor',
    id: 46640218,
    avatar_url: 'https://avatars2.githubusercontent.com/u/46640218?v=4',
    url: 'https://api.github.com/users/testathorTutor'
  }
};
