import {Team} from './team.model';
import { TesterResponse } from './tester-response.model';

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
  status?: string;
  teamAssigned?: Team;
  todoList?: string[];
  teamResponse?: string;
  tutorResponse?: string;
  testerResponses?: TesterResponse[];
}

export interface Issues {
  [id: number]: Issue;
}

/**
 * The types of labels in Issue must follow the format of `Type`.`Value`.
 * Where `Type` represent the type of the label. (e.g. severity, type, response)
 * And `Value` represent the value that is associated to the `Type` (e.g. for severity Type, it could be Low, Medium, High)
 */
export const LABELS = ['severity', 'type', 'response', 'duplicate', 'status'];

export const labelsToAttributeMapping = {
  'severity': 'severity',
  'type': 'type',
  'response': 'responseTag',
  'status': 'status',
};

export const SEVERITY_ORDER = { Low: 0, Medium: 1, High: 2 };

export const ISSUE_TYPE_ORDER = { DocumentationBug: 0, FunctionalityBug: 1 };

export enum STATUS {
  Incomplete = 'Incomplete',
  Done = 'Done',
}

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
  response: Object.keys(RESPONSE),
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
  phaseTesterResponse: {
    Student: 'NO_FILTER',
    Tutor: 'NO_ACCESS',
    Admin: 'NO_FILTER',
  },
  phase3: {
    Student: 'NO_ACCESS',
    Tutor: 'FILTER_BY_TEAM_ASSIGNED',
    Admin: 'NO_FILTER',
  }
};

export enum RespondType {
  teamResponse = 'teamResponse',
  tutorResponse = 'tutorResponse',
}

export const phase2DescriptionTemplate = new RegExp('(?<header># Description|# Team\'s Response|## State the duplicated issue ' +
  'here, if any)\\s+(?<description>[\\s\\S]*?)(?=# Team\'s Response|## State the duplicated issue here, if any|$)', 'gi');
export const phase3DescriptionTemplate = new RegExp('(?<header># Description|# Team\'s Response|## State the duplicated issue ' +
  'here, if any|## Proposed Assignees|# Tutor\'s Response|## Tutor to check)\\s+(?<description>[\\s\\S]*?)(?=# Team\'s Response|' +
  '## State the duplicated issue here, if any|## Proposed Assignees|# Tutor\'s Response|## Tutor to check|$)', 'gi');
export const phaseTesterResponseDescriptionTemplate = new RegExp('(?<header># Description|# Team\'s Response|## State ' +
  'the duplicated issue here, if any|# Items for the Tester to Verify)\\s+(?<description>[\\s\\S]*?)(?=# Team\'s Response' +
  '|## State the duplicated issue here, if any|# Items for the Tester to Verify|$)', 'gi');

