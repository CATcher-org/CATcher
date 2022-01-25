import { Checkbox } from './checkbox.model';
export class IssueDispute {
  readonly TODO_DESCRIPTION = 'Done';
  readonly INITIAL_RESPONSE = '[replace this with your explanation]';
  readonly TITLE_PREFIX = '## :question: ';
  readonly LINE_BREAK = '-------------------\n';
  title: string; // e.g Issue severity
  description: string; // e.g Team says: xxx\n Tester says: xxx.
  tutorResponse: string; // e.g Not justified. I've changed it back.
  todo: Checkbox; // e.g  - [x] Done

  constructor(title: string, description: string) {
    this.title = title;
    this.description = description;
    this.tutorResponse = this.INITIAL_RESPONSE;
    this.todo = new Checkbox(this.TODO_DESCRIPTION, false);
  }

  isDone(): boolean {
    return this.todo.isChecked;
  }

  /*
  This method is used to format the tutor's response so that the app can upload it on Github.
  Refer to format in https://github.com/CATcher-org/templates#app-collect-tutor-response
  */
  toTutorResponseString(): string {
    let toString = '';
    toString += this.TITLE_PREFIX + this.title + '\n\n';
    toString += this.todo.toString() + '\n\n';
    toString += this.tutorResponse + '\n\n';
    toString += this.LINE_BREAK;
    return toString;
  }

  compareTo(anotherResponse: IssueDispute): number {
    if (this.isDone() === anotherResponse.isDone()) {
      return this.tutorResponse.localeCompare(anotherResponse.tutorResponse);
    }
    return this.isDone() ? 1 : -1;
  }

  toString(): string {
    let toString = '';
    toString += this.TITLE_PREFIX + this.title + '\n\n';
    toString += this.description + '\n\n';
    toString += this.LINE_BREAK;
    return toString;
  }

  setTutorResponse(response: string) {
    this.tutorResponse = response;
  }

  setIsDone(isDone: boolean) {
    this.todo.setChecked(isDone);
  }
}
