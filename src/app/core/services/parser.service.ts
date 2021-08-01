import { Injectable } from '@angular/core';

/**
 * Parser Service used for parsing strings and retrieving keywords
 */
@Injectable({
  providedIn: 'root'
})
export class ParserService {

  /**
   * Returns the value of the keyword by parsing through a text of string
   *
   * @param text the string input to be parsed
   * @param prefix prefix of the string that is being searched
   * @param suffix suffix of the string that is being searched
   * @returns the string value we wish to extract
   */
  public static extractStringBetween(text: string, prefix: string, suffix: string): string {
    let result = text.trim();

    const startIdx = result.indexOf(prefix) + prefix.length;

    if (startIdx === -1)  {
      return "";
    }

    result = result.substring(startIdx);

    const endIdx = result.indexOf(suffix);

    if (endIdx === -1)  {
      return "";
    }

    result = result.substring(0, endIdx);

    return result;
  }

}
