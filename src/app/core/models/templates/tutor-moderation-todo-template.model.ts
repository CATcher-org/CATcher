import { Checkbox } from '../checkbox.model';
import { IssueComment } from '../comment.model';
import { GithubComment } from '../github/github-comment.model';
import { IssueDispute } from '../issue-dispute.model';
import { ModerationSectionParser } from './sections/moderation-section-parser.model';
import { ModerationSection } from './sections/moderation-section.model';
import { Header, Template } from './template.model';

const { coroutine, everyCharUntil, many1, str, whitespace } = require('arcsecond');

const tutorModerationTodoHeaders = {
  todo: new Header('Tutor Moderation', 1)
};

const TODO_HEADER = '# Tutor Moderation';
const DONE_CHECKBOX_DESCRIPTION = 'Done';

export const TutorModerationTodoParser = coroutine(function* () {
  str(TODO_HEADER);
  yield whitespace;

  const tutorResponses = yield many1(ModerationSectionParser);

  // build array of IssueDisputes
  const disputesToResolve: IssueDispute[] = [];

  for (const response of tutorResponses) {
    const newDispute = new IssueDispute(response.title, response.description);
    newDispute.todo = new Checkbox(DONE_CHECKBOX_DESCRIPTION, response.doneCheckboxValue);
    newDispute.tutorResponse = response.tutorResponse;
    disputesToResolve.push(newDispute);
  }

  return disputesToResolve;
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
