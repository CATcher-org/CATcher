import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.css']
})
export class ToolbarComponent implements OnInit {
  @Input() textArea;
  @Output() transformToolReturned: EventEmitter<any> = new EventEmitter();

  constructor() {}

  ngOnInit() {}

  bold(event: Event) {
    const start = this.textArea.selectionStart;
    const end = this.textArea.selectionEnd;
    let value = this.textArea.value;
    let selectedText = '';
    let insertString = '';

    if (start === end) {
      // Meaning no text selected
      insertString = '****';
      value = this.insertStringAtIndex(value, insertString, start);
      this.transformToolReturned.emit({
        value,
        cursorPosition: [start + 2, start + 2]
      });
    } else {
      // Meaning text is selected
      selectedText = value.substring(start, end);
      insertString = `**${selectedText}**`;
      value = value.slice(0, start) + value.slice(end);
      value = this.insertStringAtIndex(value, insertString, start);
      this.transformToolReturned.emit({
        value,
        cursorPosition: [end + 4, end + 4]
      });
    }
    this.textArea.focus();
  }

  italic(event: Event) {
    const start = this.textArea.selectionStart;
    const end = this.textArea.selectionEnd;
    let value = this.textArea.value;
    let selectedText = '';
    let insertString = '';

    if (start === end) {
      insertString = '**';
      value = this.insertStringAtIndex(value, insertString, start);
      this.transformToolReturned.emit({
        value,
        cursorPosition: [start + 1, start + 1]
      });
    } else {
      selectedText = value.substring(start, end);
      insertString = `*${selectedText}*`;
      value = value.slice(0, start) + value.slice(end);
      value = this.insertStringAtIndex(value, insertString, start);
      this.transformToolReturned.emit({
        value,
        cursorPosition: [end + 2, end + 2]
      });
    }
    this.textArea.focus();
  }

  strikethrough(event: Event) {
    const start = this.textArea.selectionStart;
    const end = this.textArea.selectionEnd;
    let value = this.textArea.value;
    let selectedText = '';
    let insertString = '';

    if (start === end) {
      insertString = '~~~~';
      value = this.insertStringAtIndex(value, insertString, start);
      this.transformToolReturned.emit({
        value,
        cursorPosition: [start + 2, start + 2]
      });
    } else {
      selectedText = value.substring(start, end);
      insertString = `~~${selectedText}~~`;
      value = value.slice(0, start) + value.slice(end);
      value = this.insertStringAtIndex(value, insertString, start);
      this.transformToolReturned.emit({
        value,
        cursorPosition: [end + 4, end + 4]
      });
    }
    this.textArea.focus();
  }

  uList(event: Event) {
    const start = this.textArea.selectionStart;
    const end = this.textArea.selectionEnd;
    let value = this.textArea.value;
    let selectedText = '';
    let insertString = '';

    if (start === end) {
      insertString = '- ul';
      value = this.insertStringAtIndex(value, insertString, start);
      this.transformToolReturned.emit({
        value,
        cursorPosition: [start + 2, start + 4]
      });
    } else {
      selectedText = value.substring(start, end);
      insertString = `- ${selectedText}`;
      value = value.slice(0, start) + value.slice(end);
      value = this.insertStringAtIndex(value, insertString, start);
      this.transformToolReturned.emit({
        value,
        cursorPosition: [end + 2, end + 2]
      });
    }
    this.textArea.focus();
  }

  oList(event: Event) {
    const start = this.textArea.selectionStart;
    const end = this.textArea.selectionEnd;
    let value = this.textArea.value;
    let selectedText = '';
    let insertString = '';

    if (start === end) {
      insertString = '1. ol';
      value = this.insertStringAtIndex(value, insertString, start);
      this.transformToolReturned.emit({
        value,
        cursorPosition: [start + 3, start + 5]
      });
    } else {
      selectedText = value.substring(start, end);
      insertString = `1. ${selectedText}`;
      value = value.slice(0, start) + value.slice(end);
      value = this.insertStringAtIndex(value, insertString, start);
      this.transformToolReturned.emit({
        value,
        cursorPosition: [end + 3, end + 3]
      });
    }
    this.textArea.focus();
  }

  heading(event: Event) {
    const start = this.textArea.selectionStart;
    const end = this.textArea.selectionEnd;
    let value = this.textArea.value;
    let selectedText = '';
    let insertString = '';

    if (start === end) {
      insertString = '# Heading';
      value = this.insertStringAtIndex(value, insertString, start);
      this.transformToolReturned.emit({
        value,
        cursorPosition: [start + 2, start + 9]
      });
    } else {
      selectedText = value.substring(start, end);
      insertString = `# ${selectedText}`;
      value = value.slice(0, start) + value.slice(end);
      value = this.insertStringAtIndex(value, insertString, start);
      this.transformToolReturned.emit({
        value,
        cursorPosition: [end + 2, end + 2]
      });
    }
    this.textArea.focus();
  }

  blockquotes(event: Event) {
    const start = this.textArea.selectionStart;
    const end = this.textArea.selectionEnd;
    let value = this.textArea.value;
    let selectedText = '';
    let insertString = '';

    if (start === end) {
      insertString = '> ';
      value = this.insertStringAtIndex(value, insertString, start);
      this.transformToolReturned.emit({
        value,
        cursorPosition: [start + 2, start + 2]
      });
    } else {
      selectedText = value.substring(start, end);
      insertString = `> ${selectedText}`;
      value = value.slice(0, start) + value.slice(end);
      value = this.insertStringAtIndex(value, insertString, start);
      this.transformToolReturned.emit({
        value,
        cursorPosition: [end + 2, end + 2]
      });
    }
    this.textArea.focus();
  }

  inlineCode(event: Event) {
    const start = this.textArea.selectionStart;
    const end = this.textArea.selectionEnd;
    let value = this.textArea.value;
    let selectedText = '';
    let insertString = '';

    if (start === end) {
      insertString = '``';
      value = this.insertStringAtIndex(value, insertString, start);
      this.transformToolReturned.emit({
        value,
        cursorPosition: [start + 1, start + 1]
      });
    } else {
      selectedText = value.substring(start, end);
      insertString = '`' + `${selectedText}` + '`';
      value = value.slice(0, start) + value.slice(end);
      value = this.insertStringAtIndex(value, insertString, start);
      this.transformToolReturned.emit({
        value,
        cursorPosition: [end + 2, end + 2]
      });
    }
    this.textArea.focus();
  }

  insertLink(event: Event) {
    const start = this.textArea.selectionStart;
    const end = this.textArea.selectionEnd;
    let value = this.textArea.value;
    let selectedText = '';
    let insertString = '';

    if (start === end) {
      insertString = `[enter link description here](https://)`;
      value = this.insertStringAtIndex(value, insertString, start);
      this.transformToolReturned.emit({
        value,
        cursorPosition: [start + 1, start + 28]
      });
    } else {
      selectedText = value.substring(start, end);
      insertString = `[${selectedText}](https://)`;
      value = value.slice(0, start) + value.slice(end);
      value = this.insertStringAtIndex(value, insertString, start);
      this.transformToolReturned.emit({
        value,
        cursorPosition: [end + 3, end + 11]
      });
    }
    this.textArea.focus();
  }

  insertImage(event: Event) {
    const start = this.textArea.selectionStart;
    const end = this.textArea.selectionEnd;
    let value = this.textArea.value;
    let selectedText = '';
    let insertString = '';

    if (start === end) {
      insertString = `![Alt Text](url)`;
      value = this.insertStringAtIndex(value, insertString, start);
      this.transformToolReturned.emit({
        value,
        cursorPosition: [start + 12, start + 15]
      });
    } else {
      selectedText = value.substring(start, end);
      insertString = `![${selectedText}](url)`;
      value = value.slice(0, start) + value.slice(end);
      value = this.insertStringAtIndex(value, insertString, start);
      this.transformToolReturned.emit({
        value,
        cursorPosition: [end + 4, end + 7]
      });
    }
    this.textArea.focus();
  }

  insertTable(event: Event) {
    const start = this.textArea.selectionStart;
    const end = this.textArea.selectionEnd;
    let value = this.textArea.value;
    let selectedText = '';
    let insertString = '';

    if (start === end) {
      insertString = '|  |  |\n|--|--|\n|  |  |';
      value = this.insertStringAtIndex(value, insertString, start);
      this.transformToolReturned.emit({
        value,
        cursorPosition: [start + 2, start + 2]
      });
    } else {
      selectedText = value.substring(start, end);
      insertString = `| ${selectedText} |  |\n|--|--|\n|  |  |`;
      value = value.slice(0, start) + value.slice(end);
      value = this.insertStringAtIndex(value, insertString, start);
      this.transformToolReturned.emit({
        value,
        cursorPosition: [start + 2, end + 2]
      });
    }
    this.textArea.focus();
  }

  insertStringAtIndex(baseString: string, insertString: string, at: number) {
    if (!at) {
      at = 0;
    }

    return baseString.slice(0, at) + insertString + baseString.slice(at);
  }
}
