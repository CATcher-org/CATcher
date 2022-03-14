import { IssueComment } from '../comment.model';
import { GithubComment } from '../github/github-comment.model';
import { ModerationSection } from './sections/moderation-section.model';
import { Header, Template } from './template.model';

const tutorModerationTodoHeaders = {
  todo: new Header('Tutor Moderation', 1)
};

export class TutorModerationTodoTemplate extends Template {
  moderation: ModerationSection;
  comment: IssueComment;

  constructor(githubComments: GithubComment[]) {
    super(Object.values(tutorModerationTodoHeaders));

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
