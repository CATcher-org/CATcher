import { GithubComment } from '../github/github-comment.model';
import { SectionalDependency } from './sections/section.model';

export abstract class Template {
  headers: Header[];
  parser;
  parseResult;
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

  /**
   * Finds a comment that conforms to the template
   */
  findConformingComment(githubComments: GithubComment[]): GithubComment {
    let templateConformingComment: GithubComment;

    for (const comment of githubComments) {
      const parsed = this.parser.run(comment.body);
      if (!parsed.isError) {
        this.parseResult = parsed.result;
        templateConformingComment = comment;
        break;
      }
    }

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
