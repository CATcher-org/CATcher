import {
  TutorModerationTodoParser,
  TutorModerationTodoTemplate
} from '../../../src/app/core/models/templates/tutor-moderation-todo-template.model';

import { PENDING_TUTOR_MODERATION } from '../../constants/githubcomment.constants';

const EMPTY_DONE_CHECKBOX = '- [ ] Done';
const FILLED_DONE_CHECKBOX = '- [x] Done';
const DEFAULT_TUTOR_RESPONSE = '[replace this with your explanation]';
const TEST_TUTOR_RESPONSE = 'test';
const DEFAULT_DESCRIPTION = EMPTY_DONE_CHECKBOX + '\n\n' + DEFAULT_TUTOR_RESPONSE;
const TEST_DESCRIPTION = FILLED_DONE_CHECKBOX + '\n\n' + TEST_TUTOR_RESPONSE;

const TYPE_TITLE = 'Issue Type';
const SEVERITY_TITLE = 'Issue Severity';
const NOT_RELATED_TITLE = 'Not Related Question';

describe('TutorModerationTodoParser', () => {
  it('parses comment body correctly', () => {
    const result = TutorModerationTodoParser.run(PENDING_TUTOR_MODERATION.body).result;

    expect(result[0].title).toBe(TYPE_TITLE);
    expect(result[0].description).toBe(TEST_DESCRIPTION);
    expect(result[0].todo.isChecked).toBe(true);
    expect(result[0].tutorResponse).toBe(TEST_TUTOR_RESPONSE);

    expect(result[1].title).toBe(SEVERITY_TITLE);
    expect(result[1].description).toBe(DEFAULT_DESCRIPTION);
    expect(result[1].todo.isChecked).toBe(false);
    expect(result[1].tutorResponse).toBe(DEFAULT_TUTOR_RESPONSE);

    expect(result[2].title).toBe(NOT_RELATED_TITLE);
    expect(result[2].description).toBe(DEFAULT_DESCRIPTION);
    expect(result[2].todo.isChecked).toBe(false);
    expect(result[2].tutorResponse).toBe(DEFAULT_TUTOR_RESPONSE);
  });
});

describe('TutorModerationTodoTemplate', () => {
  it('parses the github comment successfully', () => {
    const template = new TutorModerationTodoTemplate([PENDING_TUTOR_MODERATION]);

    expect(template.moderation[0].title).toBe(TYPE_TITLE);
    expect(template.moderation[0].description).toBe(TEST_DESCRIPTION);
    expect(template.moderation[0].todo.isChecked).toBe(true);
    expect(template.moderation[0].tutorResponse).toBe(TEST_TUTOR_RESPONSE);

    expect(template.moderation[1].title).toBe(SEVERITY_TITLE);
    expect(template.moderation[1].description).toBe(DEFAULT_DESCRIPTION);
    expect(template.moderation[1].todo.isChecked).toBe(false);
    expect(template.moderation[1].tutorResponse).toBe(DEFAULT_TUTOR_RESPONSE);

    expect(template.moderation[2].title).toBe(NOT_RELATED_TITLE);
    expect(template.moderation[2].description).toBe(DEFAULT_DESCRIPTION);
    expect(template.moderation[2].todo.isChecked).toBe(false);
    expect(template.moderation[2].tutorResponse).toBe(DEFAULT_TUTOR_RESPONSE);
  });
});
