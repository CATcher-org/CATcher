export class Label {

  labelCategory: string;
  labelValue: string;
  labelColor: string;

  constructor(labelCategory: string, labelValue: string, labelColor: string) {
    this.labelValue = labelValue;
    this.labelColor = labelColor;
    this.labelCategory = labelCategory;
  }

  /**
   * Returns the name of the label with the format of
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
