/**
 * A model to represent a hidden dataset stored in a string.
 */
export class HiddenData {
  private static REGEX = /<!--(.*?)-->/gm;

  readonly originalStringWithoutHiddenData: string;
  private data = new Map<string, string>();

  constructor(data: string) {
    const matches = data.match(HiddenData.REGEX);
    this.originalStringWithoutHiddenData = data.replace(HiddenData.REGEX, '').trim();
    if (matches === null) {
      return;
    }

    for (const match of matches) {
      let info = match.replace('<!--', '').trim();
      info = info.replace('-->', '').trim();
      const keyValuePair = info.split(':').map((v) => v.trim());
      if (keyValuePair.length !== 2) {
        this.originalStringWithoutHiddenData += `\n${match}`;
        continue;
      }

      const [key, value] = keyValuePair;
      if (!this.data.has(key)) {
        this.data.set(key, value);
      }
    }
  }

  /**
   * @param originalString - The original string to append the hidden data into.
   * @param hiddenData - The map of hidden data to be embedded into the string.
   * @returns - The string with the embedded data.
   */
  static embedDataIntoString(originalString: string, hiddenData: Map<string, string>): string {
    let result = originalString;
    hiddenData.forEach((value, key) => {
      result += `\n<!--${key}: ${value}-->`;
    });
    return result;
  }

  toString(): string {
    let result = '';
    this.data.forEach((value, key) => {
      result += `<!--${key}: ${value}-->`;
    });
    return result;
  }
}
