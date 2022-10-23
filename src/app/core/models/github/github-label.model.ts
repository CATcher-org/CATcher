export class GithubLabel {
  static readonly LABEL_ORDER = {
    severity: { Low: 0, Medium: 1, High: 2 },
    type: { DocumentationBug: 0, FunctionalityBug: 1 }
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
  category: string;
  label: string;
  url: string;
  description: string;

  constructor(githubLabels: {}) {
    Object.assign(this, githubLabels);

    if (this.isCategorical()) {
      this.category = this.name.split('.')[0];
      this.label = this.name.split('.')[1];
    } else {
      this.category = this.name;
      this.label = this.name;
    }
    Object.freeze(this);
  }

  getCategory(): string {
    return this.category;
  }

  getValue(): string {
    return this.label;
  }

  getDescription(): string {
    return this.description;
  }

  isCategorical(): boolean {
    const regex = /^[^.]+\.[^.]+$/;
    return regex.test(this.name);
  }
}
