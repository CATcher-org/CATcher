import { GithubIssue } from '../../src/app/core/models/github/github-issue.model';
import {
  GITHUB_LABEL_FUNCTIONALITY_BUG,
  GITHUB_LABEL_MEDIUM_SEVERITY,
  GITHUB_LABEL_TEAM_LABEL,
  GITHUB_LABEL_TUTORIAL_LABEL
} from '../constants/githublabel.constants';
import { IssueState } from '../../graphql/graphql-types';
import { EMPTY_TEAM_RESPONSE, PENDING_TUTOR_MODERATION } from './githubcomment.constants';

export const ISSUE_WITH_EMPTY_DESCRIPTION = new GithubIssue({
  id: '574085971',
  number: 92,
  assignees: [],
  comments: [],
  body: '',
  created_at: '2020-03-02T16:19:02Z',
  labels: [GITHUB_LABEL_TEAM_LABEL, GITHUB_LABEL_TUTORIAL_LABEL,
    GITHUB_LABEL_FUNCTIONALITY_BUG, GITHUB_LABEL_MEDIUM_SEVERITY],
  state: IssueState.Open,
  title: 'App starts to lag when given large amount of input',
  updated_at: '2020-03-13T13:37:32Z',
  url: 'https://api.github.com/repos/CATcher-org/pe-results/issues/92',
  user: {
    login: 'anubh-v',
    avatar_url: 'https://avatars1.githubusercontent.com/u/35621759?v=4',
    url: 'https://api.github.com/users/anubh-v',
  },
});

export const ISSUE_WITH_ASSIGNEES = new GithubIssue({
  id: '551732011',
  number: 91,
  assignees: [
    {
      login: 'anubh-v',
      id: 35621759,
      url: 'https://api.github.com/users/anubh-v',
    }
  ],
  body: 'Screen freezes every few minutes',
  created_at: '2020-01-18T07:01:45Z',
  labels: [GITHUB_LABEL_TEAM_LABEL, GITHUB_LABEL_TUTORIAL_LABEL,
      GITHUB_LABEL_FUNCTIONALITY_BUG, GITHUB_LABEL_MEDIUM_SEVERITY
     ],
  state: IssueState.Open,
  title: 'Screen freezes',
  updated_at: '2020-03-02T12:50:02Z',
  url: 'https://api.github.com/repos/CATcher-org/pe-results/issues/91',
  user: {
    login: 'anubh-v',
    avatar_url: 'https://avatars1.githubusercontent.com/u/35621759?v=4',
    url: 'https://api.github.com/users/anubh-v',
  },
  comments: [EMPTY_TEAM_RESPONSE],
});

export const ISSUE_PENDING_MODERATION = new GithubIssue({
  id: '574674360',
  number: 26,
  assignees: [
    {
      login: 'geshuming',
      id: 43642522,
      url: 'https://api.github.com/users/geshuming',
    }
  ],
  body: '# Issue Description\n{original issue description}\n' +
    '# Team\'s Response\n{team\'s response}\n # Disputes\n\n' +
    '## :question: Issue Type\n\n### Team says:\r\n{the team\'s action that is being disputed}\r\n\r\n' +
    '### Tester says:\r\n{tester\'s objection}\n\n-------------------\n## :question: Issue Severity\n\n' +
    '### Team says:\r\n{the team\'s action that is being disputed}\r\n\r\n' +
    '### Tester says:\r\n{tester\'s objection}\n\n-------------------\n## :question: Not Related Question\n\n' +
    '### Team says:\r\n{the team\'s action that is being disputed}\r\n\r\n' +
    '### Tester says:\r\n{tester\'s objection}\n\n-------------------\n\n',
  created_at: '2020-03-03T13:38:32Z',
  labels: [GITHUB_LABEL_TEAM_LABEL, GITHUB_LABEL_TUTORIAL_LABEL,
      GITHUB_LABEL_FUNCTIONALITY_BUG, GITHUB_LABEL_MEDIUM_SEVERITY
     ],
  state: IssueState.Open,
  title: 'Basic Issue, Three Disputes, Unsure',
  updated_at: '2020-08-15T06:39:40Z',
  url: 'https://api.github.com/repos/CATcher-org/pe-results/issues/26',
  user: {
    login: 'geshuming',
    avatar_url: 'https://avatars0.githubusercontent.com/u/43642522?v=4',
    url: 'https://api.github.com/users/geshuming',
  },
  comments: [PENDING_TUTOR_MODERATION],
});

