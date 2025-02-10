import { GithubComment } from './github-comment.model';
import { GithubLabel } from './github-label.model';

export type RestGithubIssueState = 'open' | 'closed' | 'all';

export type GithubRestIssue = {
  id: string; // Github's backend's id
  number: number; // Issue's display id
  assignees: Array<{
    id: number;
    login: string;
    url: string;
  }>;
  body: string;
  created_at: string;
  labels: Array<GithubLabel>;
  state: RestGithubIssueState;
  title: string;
  updated_at: string;
  url: string;
  user: {
    // Author of the issue
    login: string;
    avatar_url: string;
    url: string;
  };
  comments: Array<GithubComment>;
};
