export class IssueDispute {
    title: string; // e.g Downgrade of severity
    description: string; // e.g Team says: xxx\n Tester says: xxx.
    tutorResponse: string; // e.g Not justified. I've changed it back.
    todo: string; // e.g  - [x] Done

    constructor(title: string, description: string) {
        this.title = title;
        this.description = description;
        this.tutorResponse = '[replace this with your explanation]';
        this.todo = '- [ ] Done';
    }

    /*
    This method is used to format the tutor's response so that the app can upload it on Github.
    Refer to format in https://github.com/CATcher-org/templates#app-collect-tutor-response
    */
    toTutorResponseString(): string {
        let toString = '';
        toString += '## :question: ' + this.title + '\n\n';
        toString += this.todo + '\n\n';
        toString += this.tutorResponse + '\n\n';
        toString += '-------------------\n';
        return toString;
      }

    toString(): string {
        let toString = '';
        toString += '## :question: ' +  this.title + '\n\n';
        toString += this.description + '\n\n';
        toString += '-------------------\n';
        return toString;
    }
}
