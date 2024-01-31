/**
 * A Tutor Moderation Todo comment has this format:
 *
 * # Tutor Moderation
 *
 * { 1 or more Tutor Moderation sections, see moderation-section-parser.model.ts }
 *
 * A concrete example would be:
 *
 * # Tutor Moderation
 *
 * ## :question: Issue severity
 * - [x] Done
 *
 * I think it is justified.
 *
 * <catcher-end-of-segment><hr>
 *
 * ## :question: Issue type
 * - [ ] Done
 *
 * <catcher-end-of-segment><hr>
 */

import { IssueComment } from '../comment.model';
import { GithubComment } from '../github/github-comment.model';
import { IssueDispute } from '../issue-dispute.model';
import { ModerationSectionParser } from './section-parsers/moderation-section-parser.model';
import { Template } from './template.model';

const { coroutine, many1, str, whitespace } = require('arcsecond');

interface TutorModerationTodoParseResult {
  disputesToResolve: IssueDispute[];
}

const TODO_HEADER = '# Tutor Moderation';

export const TutorModerationTodoParser = coroutine(function* () {
  yield str(TODO_HEADER);
  yield whitespace;

  const tutorResponses = yield many1(ModerationSectionParser);

  const result: TutorModerationTodoParseResult = {
    disputesToResolve: tutorResponses
  };
  return result;
});

export class TutorModerationTodoTemplate extends Template {
  disputesToResolve: IssueDispute[];
  comment: IssueComment;

  constructor(githubComments: GithubComment[]) {
    super(TutorModerationTodoParser);

    const templateConformingComment = this.findConformingComment(githubComments);

    if (this.parseFailure) {
      return;
    }

    this.comment = <IssueComment>{
      ...templateConformingComment,
      description: templateConformingComment.body
    };
    this.disputesToResolve = this.parseResult.disputesToResolve;
  }
}
