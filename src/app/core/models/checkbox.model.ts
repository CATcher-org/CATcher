export class Checkbox {
  description: string; // in the format of - [ ] or - [x]
  isChecked: boolean;

  constructor(description: string, isChecked: boolean) {
    this.description = description;
    this.isChecked = isChecked;
  }

  setChecked(isChecked: boolean) {
    this.isChecked = isChecked;
  }

  toString(): string {
    return `- ${this.isChecked ? '[x]' : '[ ]'} ${this.description}`;
  }
}
