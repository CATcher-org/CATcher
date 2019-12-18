import DiffMatchPatch from 'diff-match-patch';
import { escapeHTML, replaceNewlinesWithBreakLines } from '../../shared/lib/html';

abstract class Changes {
  abstract readonly TYPE: string;
  abstract readonly TAG: string;
  abstract readonly STYLES: string[];
  abstract readonly content: string;

  getHtmlString(): string {
    return `<${this.TAG} style="${this.STYLES.join(';')}">${escapeHTML(this.content)}</${this.TAG}>`;
  }
}

class Addition extends Changes {
  readonly TYPE = 'ADDITION';
  readonly TAG = 'ins';
  readonly STYLES = ['background: #d4fcbc', 'text-decoration: none'];
  readonly content: string;

  constructor(content: string) {
    super();
    this.content = content;
  }
}

class Removal extends Changes {
  readonly TYPE = 'REMOVAL';
  readonly TAG = 'del';
  readonly STYLES = ['background: #fbb'];
  readonly content: string;

  constructor(content: string) {
    super();
    this.content = content;
  }
}

class NoChange extends Changes {
  readonly TYPE = 'NO_CHANGE';
  readonly TAG = 'span';
  readonly STYLES = [];
  readonly content: string;

  constructor(content: string) {
    super();
    this.content = content;
  }
}

/**
 * A model to represent the difference/conflict between two text.
 */
export class Conflict {
  outdatedContent: string;
  updatedContent: string;
  changes: Changes[] = [];

  constructor(outdatedContent: string, updatedContent: string) {
    this.outdatedContent = outdatedContent;
    this.updatedContent = updatedContent;

    const matcher = new DiffMatchPatch();
    const diffs = matcher.diff_main(outdatedContent, updatedContent);
    matcher.diff_cleanupSemantic(diffs);
    for (const diff of diffs) {
      if (diff[0] === -1) {
        this.changes.push(new Removal(diff[1]));
      } else if (diff[0] === 1) {
        this.changes.push(new Addition(diff[1]));
      } else {
        this.changes.push(new NoChange(diff[1]));
      }
    }
  }

  getHtmlDiffString(): string {
    let result = '';
    for (const change of this.changes) {
      result += change.getHtmlString();
    }
    return replaceNewlinesWithBreakLines(result);
  }

  getHtmlUpdatedString(): string {
    return replaceNewlinesWithBreakLines(escapeHTML(this.updatedContent));
  }
}
