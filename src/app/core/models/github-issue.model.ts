export class GithubIssue {
  id: number; // Github's backend's id
  number: number; // Issue's display id
  assignees: Array<{
    id: number,
    login: string,
    url: string,
  }>;
  body: string;
  created_at: string;
  labels: Array<GithubLabel>;
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

  constructor(githubIssue: {}) {
    Object.assign(this, githubIssue);
    this.labels = [];
    for (const label of githubIssue['labels']) {
      this.labels.push(new GithubLabel(label));
    }
  }

  /**
   *
   * @param name Depending on the isCategorical flag, this name either refers to the category name of label or the exact name of label.
   * @param isCategorical Whether the label is categorical.
   */
  findLabel(name: string, isCategorical: boolean = true): string {
    if (!isCategorical) {
      const label = this.labels.find(l => (!l.isCategorical() && l.name === name));
      return label ? label.getValue() : undefined;
    }

    // Find labels with the same category name as what is specified in the parameter.
    const labels = this.labels.filter(l => (l.isCategorical() && l.getCategory() === name));
    if (labels.length === 0) {
      return undefined;
    } else if (labels.length === 1) {
      return labels[0].getValue();
    } else {
      // If Label order is not specified, return the first label value else
      // If Label order is specified, return the highest ranking label value
      if (!GithubLabel.LABEL_ORDER[name]) {
        return labels[0].getValue();
      } else {
        const order = GithubLabel.LABEL_ORDER[name];
        return labels.reduce((result, currLabel) => {
          return order[currLabel.getValue()] > order[result.getValue()] ? currLabel : result;
        }).getValue();
      }
    }
  }

  findTeamId(): string {
    return `${this.findLabel('team')}.${this.findLabel('tutorial')}`;
  }
}

export class GithubLabel {
  static readonly LABEL_ORDER = {
    severity: { Low: 0, Medium: 1, High: 2 },
    type: { DocumentationBug: 0, FunctionalityBug: 1 },
  };
  static readonly LABELS = {
    severity: 'severity',
    type: 'type',
    response: 'response',
    duplicated: 'duplicated',
    unsure: 'unsure',
    pending: 'pending',
    team: 'team',
    tutorial: 'tutorial'
  };

  color: string;
  id: number;
  name: string;
  url: string;

  constructor(githubLabels: {}) {
    Object.assign(this, githubLabels);
  }

  getCategory(): string {
    if (this.isCategorical()) {
      return this.name.split('.')[0];
    } else {
      return this.name;
    }
  }

  getValue(): string {
    if (this.isCategorical()) {
      return this.name.split('.')[1];
    } else {
      return this.name;
    }
  }

  isCategorical(): boolean {
    const regex = /^\S+.\S+$/;
    return regex.test(this.name);
  }
}
