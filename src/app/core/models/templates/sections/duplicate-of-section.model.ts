import {Section, SectionalDependency} from './section.model';

export class DuplicateOfSection extends Section {
  private readonly duplicateOfRegex = /duplicate of\s*#(\d+)/i;
  issueNumber: number;

  constructor(sectionalDependency: SectionalDependency, unprocessedContent: string) {
    super(sectionalDependency, unprocessedContent);
    if (!this.parseError) {
      this.issueNumber = this.parseDuplicateOfValue(this.content);
    }
  }

  private parseDuplicateOfValue(toParse): number {
    const result = this.duplicateOfRegex.exec(toParse);
    return result ? +result[1] : null;
  }

  toString(): string {
    let toString = '';
    toString += `${this.header}\n`;
    toString += this.parseError ? '--' : `Duplicate of ${this.issueNumber}\n`;
    return toString;
  }
}
