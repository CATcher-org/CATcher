export interface IssueComment {
  id: number;
  description: string;
  createdAt: string;
  updatedAt: string;
  duplicateOf?: number;
}

export interface IssueComments {
  issueId: number;
  teamResponse?: IssueComment;
  testerObjection?: IssueComment;
  tutorResponse?: IssueComment;
}
