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
  findLabel(name: string, isCategorical: boolean = true) {
    const label = this.labels.find(l => (l.isCategorical() === isCategorical && l.getCategory() === name));
    return label ? label.getCategoryValue() : undefined;
  }
}

export class GithubLabel {
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
      return '';
    }
  }

  getCategoryValue(): string {
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
