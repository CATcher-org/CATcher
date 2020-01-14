import { Changes } from './changes.model';

export class Removal extends Changes {
  readonly TYPE = 'REMOVAL';
  readonly TAG = 'del';
  readonly STYLES = ['background: #fbb'];
  readonly content: string;

  constructor(content: string) {
    super();
    this.content = content;
  }
}
