import { Header, Template } from './template.model';
import { ModerationSection } from './sections/moderation-section.model';
import { GithubComment } from '../github-comment.model';


const tutorModerationTodoHeaders = {
  todo: new Header('Tutor Moderation', 1),
};

export class TutorModerationTodoTemplate extends Template {
  moderation: ModerationSection;

  constructor(githubComments: GithubComment[]) {
    super(Object.values(tutorModerationTodoHeaders));

    const templateConformingComment = githubComments.find(comment => this.test(comment.body)).body;
    this.moderation = this.parseModeration(templateConformingComment);
  }

  parseModeration(toParse: string): ModerationSection {
    return new ModerationSection(this.getSectionalDependency(tutorModerationTodoHeaders.todo), toParse);
  }
}
