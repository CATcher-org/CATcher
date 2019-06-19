export interface Label {
  labelValue: string;
  labelColor: string;
  labelCategory: LABEL_CATEGORY;
}

export enum LABEL_CATEGORY {
  severity = 'severity',
  type = 'type',
  response = 'response',
  status = 'status'
}

export enum CATEGORY_STATUS_VALUES {
  Incomplete = 'Incomplete',
  Done = 'Done',
}

export enum CATEGORY_SEVERITY_VALUES {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
}

export enum CATEGORY_TYPE_VALUES {
  DocumentationBug = 'DocumentationBug',
  FunctionalityBug = 'FunctionalityBug',
}

export enum CATEGORY_RESPONSE_VALUES {
  Accepted = 'Accepted',
  Rejected = 'Rejected',
  IssueUnclear = 'IssueUnclear',
  CannotReproduce = 'CannotReproduce',
}

export const LABEL_VALUES = {
  severity: CATEGORY_SEVERITY_VALUES,
  type: CATEGORY_TYPE_VALUES,
  response: CATEGORY_RESPONSE_VALUES,
  status: CATEGORY_STATUS_VALUES
};

export const DEFAULT_LABEL_COLOR = 'ededed';

enum STATUS_COLORS {
  Incomplete = 'b3ecff',
  Done = 'b3ecff'
}

enum SEVERITY_COLORS {
  Low = 'ffb3b3',
  Medium = 'ff6666',
  High = 'b30000'
}

enum TYPE_COLORS {
  DocumentationBug = 'ccb3ff',
  FunctionalityBug = 'ccb3ff'
}

enum RESPONSE_COLORS {
  Accepted = '80ffcc',
  Rejected = 'ff80b3',
  IssueUnclear = 'ffcc80',
  CannotReproduce = 'bfbfbf'
}

export const LABEL_COLORS = {
  status: STATUS_COLORS,
  severity: SEVERITY_COLORS,
  type: TYPE_COLORS,
  response: RESPONSE_COLORS
};
