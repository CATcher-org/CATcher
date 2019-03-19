export interface IssueComment {
  id: number;
  description: string;
  createdAt?: string;
  updatedAt?: string;
  duplicateOf?: number;
}

export interface IssueComments {
  issueId: number;
  responseId: number;
  teamResponse?: IssueComment;
  tutorResponse?: IssueComment;
  comments?: IssueComment[];
}

export enum RespondType {
  teamResponse = 'teamResponse',
  tutorResponse = 'tutorResponse',
}

// tslint:disable-next-line
export const phase3ResponseTemplate = /(?<header>## Tutor's Response|## State the duplicated issue here, if any)\s+(?<description>[\s\S]*?)(?=## Tutor's Response|## State the duplicated issue here, if any|$)/gi;

export const phase2ResponseTemplate = new RegExp("(?<header>## Team's Response|## State the duplicated issue here, if any)\\s+(?<description>[\\s\\S]*?)(?=## Team's Response|## State the duplicated issue here, if any|$)", 'gi');
