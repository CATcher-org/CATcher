import {Team} from './team.model';

export interface Issue {
  readonly id: number;
  readonly created_at: string;
  title: string;
  type: string;
  severity: string;
  description?: string;
  responseTag?: string;
  assignees?: string[];
  duplicated?: boolean;
  duplicateOf?: number;
  teamAssigned?: Team;
}

export interface Issues {
  [id: number]: Issue;
}

/**
 * The types of labels in Issue must follow the format of `Type`.`Value`.
 * Where `Type` represent the type of the label. (e.g. severity, type, response)
 * And `Value` represent the value that is associated to the `Type` (e.g. for severity Type, it could be Low, Medium, High)
 */
export const LABELS = ['severity', 'type', 'response', 'duplicate'];

export const labelsToAttributeMapping = {
  'severity': 'severity',
  'type': 'type',
  'response': 'responseTag',
};

export const SEVERITY_ORDER = { Low: 0, Medium: 1, High: 2 };

export const ISSUE_TYPE_ORDER = { DocumentationBug: 0, FunctionalityBug: 1 };

export enum SEVERITY {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
}

export enum TYPE {
  DocumentationBug = 'DocumentationBug',
  FunctionalityBug = 'FunctionalityBug',
}

export enum RESPONSE {
  Accepted = 'Accepted',
  Rejected = 'Rejected',
  IssueUnclear = 'IssueUnclear',
  CannotReproduce = 'CannotReproduce',
}

export const ISSUE_LABELS = {
  severity: Object.keys(SEVERITY),
  type: Object.keys(TYPE),
  responseTag: Object.keys(RESPONSE),
};

export const IssuesFilter = {
  phase1: {
    Student: 'FILTER_BY_CREATOR',
    Tutor: 'NO_FILTER',
    Admin: 'NO_FILTER',
  },
  phase2: {
    Student: 'FILTER_BY_TEAM',
    Tutor: 'FILTER_BY_TEAM_ASSIGNED',
    Admin: 'NO_FILTER',
  },
  phase3: {
    Student: 'NO_ACCESS',
    Tutor: 'FILTER_BY_TEAM_ASSIGNED',
    Admin: 'NO_FILTER',
  }
};
