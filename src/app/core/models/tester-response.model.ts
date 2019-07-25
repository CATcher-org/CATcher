export class TesterResponse {
    title: string; // e.g Change of Severity
    description: string; // e.g Changed from High to Low
    disagreeCheckbox: string; // e.g [x] I disagree
    reasonForDiagreement: string;

    constructor(title: string, description: string, disagreeCheckbox: string, reasonForDiagreement: string) {
        this.title = title;
        this.description = description;
        this.disagreeCheckbox = disagreeCheckbox;
        this.reasonForDiagreement = reasonForDiagreement;
    }

    toString(): string {
      let toString = '';
      toString += '## :question: ' + this.title + '\n\n';
      toString += this.description + '\n\n';
      toString += this.disagreeCheckbox + '\n\n';
      toString += '**Reason for disagreement:** ' + this.reasonForDiagreement + '\n\n';
      toString += '-------------------\n';
      return toString;
    }
}
