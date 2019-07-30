export class IssueDispute {
    readonly TODO_UNCHECKED = '- [ ] Done';
    readonly INITIAL_RESPONSE = '[replace this with your explanation]';
    readonly TITLE_PREFIX = '## :question: ';
    readonly LINE_BREAK = '-------------------\n';
    title: string; // e.g Downgrade of severity
    description: string; // e.g Team says: xxx\n Tester says: xxx.
    tutorResponse: string; // e.g Not justified. I've changed it back.
    todo: string; // e.g  - [x] Done

    constructor(title: string, description: string) {
        this.title = title;
        this.description = description;
        this.tutorResponse = this.INITIAL_RESPONSE;
        this.todo = this.TODO_UNCHECKED;
    }

    /*
    This method is used to format the tutor's response so that the app can upload it on Github.
    Refer to format in https://github.com/CATcher-org/templates#app-collect-tutor-response
    */
    toTutorResponseString(): string {
        let toString = '';
        toString += this.TITLE_PREFIX + this.title + '\n\n';
        toString += this.todo + '\n\n';
        toString += this.tutorResponse + '\n\n';
        toString += this.LINE_BREAK;
        return toString;
      }

    toString(): string {
        let toString = '';
        toString += this.TITLE_PREFIX +  this.title + '\n\n';
        toString += this.description + '\n\n';
        toString += this.LINE_BREAK;
        return toString;
    }
}
