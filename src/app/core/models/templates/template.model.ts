import { GithubComment } from '../github/github-comment.model';
import { SectionalDependency } from './sections/section.model';

const { fail } = require('arcsecond');

export const FAIL_PARSER = fail('FAIL');

export abstract class Template {
  headers: Header[];
  regex: RegExp;
  parser;
  parseFailure: boolean;

  protected constructor(parser, headers: Header[]) {
    this.parser = parser;
    this.headers = headers;
  }

  getSectionalDependency(header: Header): SectionalDependency {
    const otherHeaders = this.headers.filter((e) => !e.equals(header));
    return <SectionalDependency>{
      sectionHeader: header,
      remainingTemplateHeaders: otherHeaders
    };
  }

  test(toTest: string): boolean {
    return !this.parser.run(toTest).isError;
  }

  /**
   * Check whether the given string conforms to the template.
   */
  // test(toTest: string): boolean {
  //   let numOfMatch = 0;
  //   while (this.regex.exec(toTest) != null) {
  //     numOfMatch += 1;
  //   }
  //   this.regex.lastIndex = 0;
  //   return numOfMatch >= this.headers.length;
  // }

  /**
   * Finds a comment that conforms to the template
   */
  findConformingComment(githubComments: GithubComment[]): GithubComment {
    const templateConformingComment = githubComments.find((githubComment) => this.test(githubComment.body));
    if (templateConformingComment === undefined) {
      this.parseFailure = true;
    }
    return templateConformingComment;
  }

  /**
   * Finds a comment that conforms to the template
   */
  findConformingComment(githubComments: GithubComment[]): GithubComment {
    const templateConformingComment = githubComments.find((githubComment) => this.test(githubComment.body));
    if (templateConformingComment === undefined) {
      this.parseFailure = true;
    }
    return templateConformingComment;
  }
}

export class Header {
  name: string;
  headerHash: string;
  prefix?: string;

  constructor(name, headerSize, prefix: string = '') {
    this.name = name;
    this.headerHash = '#'.repeat(headerSize);
    this.prefix = prefix;
  }

  toString(): string {
    const prefix = this.prefix !== '' ? this.prefix + ' ' : '';
    const headerHashPrefix = this.headerHash !== '' ? this.headerHash + ' ' : '';
    return `${headerHashPrefix}${prefix}${this.name}`;
  }

  equals(section: Header): boolean {
    return this.name === section.name;
  }
}
