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
}
