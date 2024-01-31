/**
 * Comment template formats can be found at https://catcher-org.github.io/dg/user-workflow.html
 */

import { GithubComment } from '../github/github-comment.model';

export abstract class Template {
  parser;
  parseResult;
  parseError: string;
  parseFailure: boolean;

  protected constructor(parser) {
    this.parser = parser;
  }

  /**
   * Finds a comment that conforms to the template
   */
  findConformingComment(githubComments: GithubComment[]): GithubComment {
    let templateConformingComment: GithubComment;
    let parsed: any;

    for (const comment of githubComments) {
      parsed = this.parser.run(comment.body);
      if (!parsed.isError) {
        this.parseResult = parsed.result;
        templateConformingComment = comment;
        break;
      }
    }

    if (templateConformingComment === undefined) {
      this.parseFailure = true;

      if (parsed) {
        this.parseError = parsed.error;
      }
    }
    return templateConformingComment;
  }
}
