export class Label {

  labelValue: string;
  labelColor: string;
  labelCategory: string;

  constructor(labelCategory: string, labelValue: string, labelColor: string) {
    this.labelValue = labelValue;
    this.labelColor = labelColor;
    this.labelCategory = labelCategory;
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
