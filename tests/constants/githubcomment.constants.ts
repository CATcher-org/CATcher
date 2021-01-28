import { GithubComment } from '../../src/app/core/models/github/github-comment.model';

export const EMPTY_TEAM_RESPONSE: GithubComment = {
    body: '# Team\'s Response\n' +
    '\n' +
    ' ## Duplicate status (if any):\n' +
    '--',
    created_at: '2020-02-16T18:31:38Z',
    id: 586737495,
    issue_url: 'https://api.github.com/repos/CATcher-org/pe-results/issues/91',
    updated_at: '2020-03-02T12:50:02Z',
    url: 'https://api.github.com/repos/CATcher-org/pe-results/issues/comments/586737495',
    user: {
      login: 'testathorStudent',
      id: 46639862,
      avatar_url: 'https://avatars3.githubusercontent.com/u/46639862?v=4',
      url: 'https://api.github.com/users/testathorStudent',
    },
  };

  export const PENDING_TUTOR_MODERATION: GithubComment = {
    body: '# Tutor Moderation\n\n' +
      '## :question: Issue Type\n\n- [x] Done\n\ntest\n\n-------------------\n' +
      '## :question: Issue Severity\n\n- [ ] Done\n\n' +
      '[replace this with your explanation]\n\n-------------------\n' +
      '## :question: Not Related Question\n\n- [ ] Done\n\n' +
      '[replace this with your explanation]\n\n-------------------\n',
    created_at: '2020-08-15T06:39:24Z',
    id: 674357972,
    issue_url: 'https://api.github.com/repos/CATcher-org/pe-evaluation/issues/26',
    updated_at: '2020-08-15T06:39:40Z',
    url: 'https://api.github.com/repos/CATcher-org/pe-evaluation/issues/comments/674357972',
    user: {
      login: 'testathorTutor',
      id: 46640218,
      avatar_url: 'https://avatars2.githubusercontent.com/u/46640218?v=4',
      url: 'https://api.github.com/users/testathorTutor',
    },
  };
