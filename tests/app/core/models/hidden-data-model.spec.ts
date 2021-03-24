import { HiddenData } from '../../../../src/app/core/models/hidden-data.model';
const SAMPLE_KEY = 'Nunc dolor mauris, @/;\'12345\'rhoncus "et" <!-> facilisis sit amet';
const SAMPLE_VALUE = 'laoreet sit @@#$%^&*()_+amet sem.->';
const SAMPLE_KEY2 = 'Version';
const SAMPLE_VALUE2 = 'Desktop v3.4.4';
const SAMPLE_MAP = new Map<string, string>([
  [SAMPLE_KEY, SAMPLE_VALUE],
  [SAMPLE_KEY2, SAMPLE_VALUE2]
]);
const makeComment = (key: string, value: string) => `<!--${key}: ${value}-->`;
const COMMENT = makeComment(SAMPLE_KEY, SAMPLE_VALUE);
const COMMENT2 = makeComment(SAMPLE_KEY2, SAMPLE_VALUE2);

const embedComment = (comment: string) => `Lorem ipsum dolor sit amet, consectetur adipiscing elit.
Nulla viverra nunc ac blandit dictum. Praesent vel est a erat
aliquam lobortis. ${comment}Fusce eu metus ex. In tempus erat magna.
In hac habitasse platea dictumst. Aenean volutpat nibh mauris,
commodo laoreet risus lacinia vitae.`;

describe('HiddenData', () => {
  it('.embedDataIntoString should append meta info as a HTML comment', () => {
    const dataWithMetaInfo = HiddenData.embedDataIntoString(embedComment(''), SAMPLE_MAP);
    expect(dataWithMetaInfo).toEqual([embedComment(''), COMMENT, COMMENT2].join('\n'));
  });

  it('constructor should parse string for HTML comments and generate the data map from comments', () => {
    const parsedData = new HiddenData(embedComment(COMMENT));
    expect(parsedData.originalStringWithoutHiddenData).toEqual(embedComment(''));

    expect(parsedData.toString()).toEqual(COMMENT);
  });
});
