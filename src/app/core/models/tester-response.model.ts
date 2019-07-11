export interface TesterResponse {
    itemName: string; // e.g Change of Severity
    itemDescription: string; // e.g Changed from High to Low
    disagreeCheckbox: string; // e.g [x] I disagree
    reasonForDiagreement?: string;
}
