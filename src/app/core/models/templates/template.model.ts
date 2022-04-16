import { GithubComment } from '../github/github-comment.model';

export abstract class Template {
  parser;
  parseResult;
  parseFailure: boolean;

  protected constructor(parser) {
    this.parser = parser;
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
