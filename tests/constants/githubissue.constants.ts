import {GithubIssue} from '../../src/app/core/models/github/github-issue.model';
import {
  GITHUB_LABEL_FUNCTIONALITY_BUG,
  GITHUB_LABEL_MEDIUM_SEVERITY,
  GITHUB_LABEL_TEAM_LABEL,
  GITHUB_LABEL_TUTORIAL_LABEL
} from '../constants/githublabel.constants';
import {IssueState} from '../../graphql/graphql-types';

export const ISSUE_WITH_EMPTY_DESCRIPTION = new GithubIssue({
    id: '574085971',
    number: 92,
    assignees: [],
    comments: [],
    body: '',
    created_at: '2020-03-02T16:19:02Z',
    labels: [GITHUB_LABEL_TEAM_LABEL, GITHUB_LABEL_TUTORIAL_LABEL,
             GITHUB_LABEL_FUNCTIONALITY_BUG, GITHUB_LABEL_MEDIUM_SEVERITY
            ],
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
    }
});
