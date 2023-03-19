import { Checkbox } from './checkbox.model';

export class TesterResponse {
  readonly TITLE_PREFIX = '## :question: ';
  readonly DISAGREEMENT_PREFIX = '**Reason for disagreement:** ';
  readonly INITIAL_RESPONSE = '[replace this with your explanation]';
  readonly LINE_BREAK = '<catcher-end-of-segment><hr>\n';
  title: string; // e.g Issue Severity
  description: string; // e.g Team chose `Low`. Originally `High`.
  disagreeCheckbox: Checkbox; // e.g - [x] I disagree
  reasonForDisagreement: string;

  constructor(title: string, description: string, checkboxDescription: string, isChecked: boolean, reasonForDiagreement: string) {
    this.title = title;
    this.description = description;
    this.disagreeCheckbox = new Checkbox(checkboxDescription, isChecked);
    this.reasonForDisagreement = reasonForDiagreement;
  }

  toString(): string {
    let toString = '';
    toString += this.TITLE_PREFIX + this.title + '\n\n';
    toString += this.description + '\n\n';
    toString += this.disagreeCheckbox.toString() + '\n\n';
    toString += this.DISAGREEMENT_PREFIX + this.reasonForDisagreement + '\n\n';
    toString += this.LINE_BREAK;
    return toString;
  }

  isDisagree(): boolean {
    return this.disagreeCheckbox.isChecked;
  }

  compareTo(anotherResponse: TesterResponse): number {
    if (this.isDisagree() === anotherResponse.isDisagree()) {
      return this.reasonForDisagreement.localeCompare(anotherResponse.reasonForDisagreement);
    }
    return this.isDisagree() ? 1 : -1;
  }

  getTitleInMarkDown(): string {
    return `## ${this.title}`;
  }

  getDisagreementWithoutDefaultResponse(): string {
    return this.reasonForDisagreement.replace(this.INITIAL_RESPONSE, ' ');
  }

  setDisagree(isDisagree: boolean) {
    this.disagreeCheckbox.setChecked(isDisagree);
  }

  setReasonForDisagreement(reason: string) {
    this.reasonForDisagreement = reason;
  }
}
