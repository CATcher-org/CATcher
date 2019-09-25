export interface GithubComment {
  author_association: string;
  body: string;
  created_at: string;
  html_url: string;
  id: number;
  issue_url: string;
  updated_at: string;
  url: string; // api url
  user: {
    login: string,
    id: number,
    avatar_url: string,
    url: string,
  };
}
