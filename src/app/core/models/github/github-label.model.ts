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
    status: 'status',
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
    Object.freeze(this);
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
    const regex = /^\S+\.\S+$/;
    return regex.test(this.name);
  }
}
