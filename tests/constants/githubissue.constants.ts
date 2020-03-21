import { GithubIssue } from '../../src/app/core/models/github/github-issue.model';
import { GITHUB_LABEL_TEAM_LABEL, GITHUB_LABEL_TUTORIAL_LABEL, 
         GITHUB_LABEL_FUNCTIONALITY_BUG, GITHUB_LABEL_MEDIUM_SEVERITY } from '../constants/githublabel.constants';

export const ISSUE_EMPTY_DESCRIPTION = new GithubIssue({
    id: 574085971,
    number: 92,
    assignees: [],
    body: '',
    created_at: '2020-03-02T16:19:02Z',
    labels: [GITHUB_LABEL_TEAM_LABEL, GITHUB_LABEL_TUTORIAL_LABEL, 
             GITHUB_LABEL_FUNCTIONALITY_BUG, GITHUB_LABEL_MEDIUM_SEVERITY
            ],
    state: 'open',
    title: 'App starts to lag when given large amount of input',
    updated_at: '2020-03-13T13:37:32Z',
    url: 'https://api.github.com/repos/CATcher-org/pe-results/issues/92',
    user: {
        login: 'anubh-v',
        id: 35621759,
        avatar_url: 'https://avatars1.githubusercontent.com/u/35621759?v=4',
        url: 'https://api.github.com/users/anubh-v',
    }
} as GithubIssue);