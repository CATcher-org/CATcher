export class Checkbox {
  checkboxString: string; // in the format of - [ ] or - [x]

  constructor(checkboxString: string) {
    this.checkboxString = checkboxString;
  }

  isChecked(): boolean {
    return this.checkboxString.charAt(3) === 'x';
  }

  setChecked(isChecked: boolean) {
    if (isChecked) {
      this.checkboxString = this.checkboxString.replace('[ ]', '[x]');
    } else {
      this.checkboxString = this.checkboxString.replace('[x]', '[ ]');
    }
  }
}
