import { IssueTablesComponent } from '../../../../src/app/shared/issue-tables/issue-tables.component';

describe('IssueTablesComponent', () => {
  let issueTablesComponent: IssueTablesComponent;

  describe('.fitTitleText()', () => {
    beforeEach(() => {
      issueTablesComponent = new IssueTablesComponent(null, null, null, null, null, null, null, null, null);
    });

    it('should format the title text to account for words longer than max word length', () => {
      // title consisting of 1 word of 30 characters and 1 word of 50 characters
      const LONG_MIXED_TITLE = '012345678901234567890123456789 01234567890123456789012345678901234567890123456789';
      const FORMATTED_LONG_MIXED_TITLE = '012345678901234567890123456789 01234567890123456789012345678901234567...';
      expect(issueTablesComponent.fitTitleText(LONG_MIXED_TITLE)).toEqual(FORMATTED_LONG_MIXED_TITLE);

      // title consisting of 2 words of 50 characters
      const LONG_TWO_WORDS_TITLE = '01234567890123456789012345678901234567890123456789 01234567890123456789012345678901234567890123456789';
      const FORMATTED_TWO_WORDS_TITLE = '01234567890123456789012345678901234567... 01234567890123456789012345678901234567...';
      expect(issueTablesComponent.fitTitleText(LONG_TWO_WORDS_TITLE)).toEqual(FORMATTED_TWO_WORDS_TITLE);
    });

    it('should retain original title if words are not longer than max word length', () => {
      // title consisting of 1 word of 30 characters
      const SHORT_TITLE = '012345678901234567890123456789';
      expect(issueTablesComponent.fitTitleText(SHORT_TITLE)).toEqual(SHORT_TITLE);

      // title consisting of 2 words of 43 characters (maximum word length)
      const MAX_LENGTH_TITLE = '0123456789012345678901234567890123456789012 0123456789012345678901234567890123456789012';
      expect(issueTablesComponent.fitTitleText(MAX_LENGTH_TITLE)).toEqual(MAX_LENGTH_TITLE);
    });
  });
});
