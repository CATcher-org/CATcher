export class Label {

  // Preset Labels.
  private static readonly REQUIRED_LABELS = {
    severity: {
      Low: new Label('severity', 'Low', 'ffb3b3'),
      Medium: new Label('severity', 'Medium', 'ff6666'),
      High: new Label('severity', 'High', 'b30000')
    },
    type: {
      DocumentationBug: new Label('type', 'DocumentationBug', 'ccb3ff'),
      FunctionalityBug: new Label('type', 'FunctionalityBug', '661aff')
    },
    response: {
      Accepted: new Label('response', 'Accepted', '80ffcc'),
      Rejected: new Label('response', 'Rejected', 'ff80b3'),
      IssueUnclear: new Label('response', 'IssueUnclear', 'ffcc80'),
      CannotReproduce: new Label('response', 'CannotReproduce', 'bfbfbf')
    },
    status: {
      Done: new Label('status', 'Done', 'b3ecff'),
      Incomplete: new Label('status', 'Incomplete', '1ac6ff')
    }
  };

  labelValue: string;
  labelColor: string;
  labelCategory: string;

  constructor(labelCategory: string, labelValue: string, labelColor: string) {
    this.labelValue = labelValue;
    this.labelColor = labelColor;
    this.labelCategory = labelCategory;
  }

  /**
   * Returns an array of Preset Labels.
   */
  public static getRequiredLabels(): Label[] {
    const requiredLabels: Label[] = [];

    for (const category of Object.keys(Label.REQUIRED_LABELS)) {
      for (const labels of Object.values(Label.REQUIRED_LABELS[category])) {
        requiredLabels.push(labels as Label);
      }
    }

    return requiredLabels;
  }

  /**
   * Returns a the name of the label with the format of
   * 'category'.'value' (e.g. severity.Low)
   */
  public getFormattedName(): string {
    return this.labelCategory + '.' + this.labelValue;
  }

  public equals(label: Label) {
    return this.labelValue === label.labelValue
        && this.labelColor === label.labelColor && this.labelCategory === label.labelCategory;
  }
}
