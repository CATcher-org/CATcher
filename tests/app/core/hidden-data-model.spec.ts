import { HiddenData } from "../../../src/app/core/models/hidden-data.model";
const SAMPLE_KEY = "Nunc dolor mauris, rhoncus et facilisis sit amet";
const SAMPLE_VALUE = "laoreet sit amet sem.";
const SAMPLE_MAP = new Map<string, string>([[SAMPLE_KEY, SAMPLE_VALUE]]);
const COMMENT = `<!--${SAMPLE_KEY}: ${SAMPLE_VALUE}-->`;

const embedComment = (
  comment
) => `Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
Nulla viverra nunc ac blandit dictum. Praesent vel est a erat 
aliquam lobortis. ${comment}Fusce eu metus ex. In tempus erat magna. 
In hac habitasse platea dictumst. Aenean volutpat nibh mauris, 
commodo laoreet risus lacinia vitae.`;

describe("HiddenData", () => {
  it(".embedDataIntoString should append some specified meta info as HTML comment", () => {
    const appendedData = HiddenData.embedDataIntoString(
      embedComment(""),
      SAMPLE_MAP
    );
    expect(appendedData).toEqual(embedComment("") + `\n${COMMENT}`);
  });

  it("instance constructor should parse string for HTML comments and generate the right data map", () => {
    const parsedData = new HiddenData(embedComment(COMMENT));
    expect(parsedData.originalStringWithoutHiddenData).toEqual(
      embedComment("")
    );

    expect(parsedData.toString()).toEqual(COMMENT);
  });
});
