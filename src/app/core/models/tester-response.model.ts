export class TesterResponse {
    readonly TITLE_PREFIX = '## :question: ';
    readonly DISAGREEMENT_PREFIX = '**Reason for disagreement:** ';
    readonly LINE_BREAK = '-------------------\n';
    title: string; // e.g Issue Severity
    description: string; // e.g Team chose `Low`. Originally `High`.
    disagreeCheckbox: string; // e.g - [x] I disagree
    reasonForDiagreement: string;

    constructor(title: string, description: string, disagreeCheckbox: string, reasonForDiagreement: string) {
        this.title = title;
        this.description = description;
        this.disagreeCheckbox = disagreeCheckbox;
        this.reasonForDiagreement = reasonForDiagreement;
    }

    toString(): string {
      let toString = '';
      toString += this.TITLE_PREFIX + this.title + '\n\n';
      toString += this.description + '\n\n';
      toString += this.disagreeCheckbox + '\n\n';
      toString += this.DISAGREEMENT_PREFIX + this.reasonForDiagreement + '\n\n';
      toString += this.LINE_BREAK;
      return toString;
    }
}
