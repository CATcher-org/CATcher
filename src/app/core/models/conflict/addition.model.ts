import { Changes } from './changes.model';

export class Addition extends Changes {
  readonly TYPE = 'ADDITION';
  readonly TAG = 'ins';
  readonly STYLES = ['background: #d4fcbc', 'text-decoration: none'];
  readonly content: string;

  constructor(content: string) {
    super();
    this.content = content;
  }
}
