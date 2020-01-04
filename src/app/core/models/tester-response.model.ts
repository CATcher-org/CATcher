export class TesterResponse {
  readonly TITLE_PREFIX = '## :question: ';
  readonly DISAGREEMENT_PREFIX = '**Reason for disagreement:** ';
  readonly INITIAL_RESPONSE = '[replace this with your explanation]';
  readonly LINE_BREAK = '-------------------\n';
  title: string; // e.g Issue Severity
  description: string; // e.g Team chose `Low`. Originally `High`.
  disagreeCheckbox: string; // e.g - [x] I disagree
  reasonForDisagreement: string;

  constructor(title: string, description: string, disagreeCheckbox: string, reasonForDiagreement: string) {
    this.title = title;
    this.description = description;
    this.disagreeCheckbox = disagreeCheckbox;
    this.reasonForDisagreement = reasonForDiagreement;
  }

  toString(): string {
    let toString = '';
    toString += this.TITLE_PREFIX + this.title + '\n\n';
    toString += this.description + '\n\n';
    toString += this.disagreeCheckbox + '\n\n';
    toString += this.DISAGREEMENT_PREFIX + this.reasonForDisagreement + '\n\n';
    toString += this.LINE_BREAK;
    return toString;
  }

  getResponseFromValue(isDisagree: boolean, reason: string): string {
    const todo = `- [${isDisagree ? 'x' : ' '}] I disagree`;
    let toString = '';
    toString += this.TITLE_PREFIX + this.title + '\n\n';
    toString += this.description + '\n\n';
    toString += todo + '\n\n';
    toString += this.DISAGREEMENT_PREFIX + reason + '\n\n';
    toString += this.LINE_BREAK;
    return toString;
  }

  isDisagree(): boolean {
    return this.disagreeCheckbox.charAt(3) === 'x';
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
}
