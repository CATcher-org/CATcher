export class TesterResponse {
    itemName: string; // e.g Change of Severity
    itemDescription: string; // e.g Changed from High to Low
    disagreeCheckbox: string; // e.g [x] I disagree
    reasonForDiagreement: string;

    constructor(itemName: string, itemDescription: string, disagreeCheckbox: string, reasonForDiagreement: string) {
        this.itemName = itemName;
        this.itemDescription = itemDescription;
        this.disagreeCheckbox = disagreeCheckbox;
        this.reasonForDiagreement = reasonForDiagreement;
      }
}
