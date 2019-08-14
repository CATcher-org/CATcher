export interface GithubIssue {
  id: number; // Github's backend's id
  number: number; // Issue's display id
  assignees: Array<{
    id: number,
    login: string,
    url: string,
  }>;
  body: string;
  created_at: string;
  html_url: string;
  labels: Array<{
    color: string,
    id: number,
    name: string,
    url: string,
  }>;
  state: string;
  title: string;
  updated_at: string;
  url: string;
  user: { // Author of the issue
    login: string,
    id: number,
    avatar_url: string,
    url: string,
  };
}
