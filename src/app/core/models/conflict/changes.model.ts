import { escapeHTML } from '../../../shared/lib/html';

export abstract class Changes {
  abstract readonly TYPE: string;
  abstract readonly TAG: string;
  abstract readonly STYLES: string[];
  abstract readonly content: string;

  getHtmlString(): string {
    return `<${this.TAG} style="${this.STYLES.join(';')}">${escapeHTML(this.content)}</${this.TAG}>`;
  }
}
