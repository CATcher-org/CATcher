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
  tutorResponse?: IssueComment;
  comments?: IssueComment[];
}

// tslint:disable-next-line
export const phase2ResponseTemplate = /(?<header>## Team's Response|## State the duplicated issue here, if any)\s+(?<description>[\s\S]*?)(?=## Team's Response|## State the duplicated issue here, if any|$)/gi;
