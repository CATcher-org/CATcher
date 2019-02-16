export interface IssueComment {
  id: number;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface IssueComments {
  issueId: number;
  teamResponse?: IssueComment;
  testerObjection?: IssueComment;
  tutorResponse?: IssueComment;
}
