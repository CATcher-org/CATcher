import { SectionalDependency } from './sections/section.model';

export abstract class Template {
  headers: Header[];
  regex: RegExp;

  protected constructor(headers: Header[]) {
    this.headers = headers;

    const headerString = headers.join('|');
    this.regex = new RegExp(`(${headerString})\\s+([\\s\\S]*?)(?=${headerString}|$)`, 'gi');
  }

  getSectionalDependency(header: Header): SectionalDependency {
    const otherHeaders = this.headers.filter(e => !e.equals(header));
    return <SectionalDependency>{
      sectionHeader: header,
      remainingTemplateHeaders: otherHeaders
    };
  }

  /**
   * Check whether the given string conforms to the template.
   */
  test(toTest: string): boolean {
    return this.regex.test(toTest);
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
    return `${this.headerHash} ${this.prefix} ${this.name}`;
  }

  equals(section: Header): boolean {
    return this.name === section.name;
  }
}
