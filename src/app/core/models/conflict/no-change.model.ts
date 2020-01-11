import { Changes } from './changes.model';

export class NoChange extends Changes {
  readonly TYPE = 'NO_CHANGE';
  readonly TAG = 'span';
  readonly STYLES = [];
  readonly content: string;

  constructor(content: string) {
    super();
    this.content = content;
  }
}
