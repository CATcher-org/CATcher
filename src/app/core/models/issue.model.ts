export interface Issue {
  readonly id: number;
  readonly created_at: string;
  title: string;
  type: string;
  severity: string;
  description?: string;
  responseTag?: string;
  assignees?: string[];
}

/**
 * The types of labels in Issue must follow the format of `Type`.`Value`.
 * Where `Type` represent the type of the label. (e.g. severity, type, response)
 * And `Value` represent the value that is associated to the `Type` (e.g. for severity Type, it could be Low, Medium, High)
 */
export const LABELS_IN_PHASE_1 = ['severity', 'type'];
export const LABELS_IN_PHASE_2 = ['severity', 'type', 'response'];

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
  Duplicate = 'Duplicate'
}

export const ISSUE_LABELS = {
  severity: Object.keys(SEVERITY),
  type: Object.keys(TYPE),
  responseTag: Object.keys(RESPONSE),
};

export enum IssuesFilter {
  filterByCreator = 'FILTER_BY_CREATOR',
  filterByTeam = 'FILTER_BY_TEAM',
  filterByTeamsAssigned = 'FILTER_BY_TEAM_ASSIGNED'
}
