import { IssueComment } from '../comment.model';
import { GithubComment } from '../github/github-comment.model';
import { ModerationSectionParser } from './sections/moderation-section-parser.model';
import { ModerationSection } from './sections/moderation-section.model';
import { Header, Template } from './template.model';

const { coroutine, many1, str, whitespace } = require('arcsecond');

const tutorModerationTodoHeaders = {
  todo: new Header('Tutor Moderation', 1)
};

const TODO_HEADER = '# Tutor Moderation';

export const TutorModerationTodoParser = coroutine(function* () {
  yield str(TODO_HEADER);
  yield whitespace;

  const tutorResponses = yield many1(ModerationSectionParser);

  return tutorResponses;
});

export class TutorModerationTodoTemplate extends Template {
  moderation: ModerationSection;
  comment: IssueComment;

  constructor(githubComments: GithubComment[]) {
    super(TutorModerationTodoParser, Object.values(tutorModerationTodoHeaders));

    const templateConformingComment = this.findConformingComment(githubComments);

    if (this.parseFailure) {
      return;
    }

    this.comment = <IssueComment>{
      ...templateConformingComment,
      description: templateConformingComment.body
    };
    this.moderation = this.parseModeration(this.comment.description);
  }

  parseModeration(toParse: string): ModerationSection {
    return new ModerationSection(this.getSectionalDependency(tutorModerationTodoHeaders.todo), toParse);
  }
}
