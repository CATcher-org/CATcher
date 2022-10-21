import { CUSTOM_ELEMENTS_SCHEMA, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Apollo } from 'apollo-angular';
import { MarkdownModule } from 'ngx-markdown';

import { CommentEditorComponent } from '../../../../src/app/shared/comment-editor/comment-editor.component';
import { MarkdownToolbarComponent } from '../../../../src/app/shared/comment-editor/markdown-toolbar/markdown-toolbar.component';
import { SharedModule } from '../../../../src/app/shared/shared.module';

describe('CommentEditor', () => {
  let fixture: ComponentFixture<CommentEditorComponent>;
  let debugElement: DebugElement;
  let component: CommentEditorComponent;

  const TEST_INITIAL_DESCRIPTION = 'abc';
  const TEST_SUBMIT_BUTTON_TEXT = 'Submit';

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CommentEditorComponent, MarkdownToolbarComponent],
      imports: [FormsModule, SharedModule, MarkdownModule.forRoot(), BrowserAnimationsModule],
      providers: [Apollo],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(CommentEditorComponent);
    debugElement = fixture.debugElement;
    component = fixture.componentInstance;

    // initialize compulsory inputs
    const commentField: FormControl = new FormControl('');
    const commentForm: FormGroup = new FormGroup({
      description: commentField
    });
    const id = 'description';

    // manually inject inputs into the component
    component.commentField = commentField;
    component.commentForm = commentForm;
    component.id = id;
    component.submitButtonText = TEST_SUBMIT_BUTTON_TEXT;
  });

  describe('formatting toolbar is rendered correctly', () => {
    const buttonsToTest = [
      'md-bold',
      'md-italic',
      'md-header',
      'md-quote',
      'md-code',
      'md-link',
      'md-image',
      'md-unordered-list',
      'md-ordered-list',
      'md-task-list',
      'md-mention',
      'md-ref'
    ];

    it('should render a formatting toolbar', () => {
      fixture.detectChanges();

      const toolBarDe: DebugElement = debugElement.query(By.css('app-markdown-toolbar'));
      expect(toolBarDe).toBeTruthy();
    });

    it('should render all buttons in the formatting toolbar', () => {
      fixture.detectChanges();

      const toolBarDe: DebugElement = debugElement.query(By.css('app-markdown-toolbar'));

      buttonsToTest.forEach((button) => {
        expect(toolBarDe.query(By.css(button))).toBeTruthy();
      });
    });
  });

  describe('all buttons in the formatting toolbar add the correct markups when text box is empty', () => {
    // key-value pair of button names and the formatting markups that they are supposed to
    // add to the text input box when clicked
    const buttonsToTest = {
      'md-bold': '****',
      'md-italic': '__',
      'md-header': '### ',
      'md-quote': '> ',
      'md-code': '``',
      'md-link': '[](url)',
      'md-image': '![](url)',
      'md-unordered-list': '- ',
      'md-ordered-list': '1. ',
      'md-task-list': `- [ ] `,
      'md-mention': '@',
      'md-ref': '#'
    };

    // simulate each button being clicked and check that the markups added to the text
    // input box are correct
    for (const [buttonName, expectedMarkup] of Object.entries(buttonsToTest)) {
      it(`should add correct markups when the ${buttonName} button is pressed`, async () => {
        fixture.detectChanges();

        const toolbarDe: DebugElement = debugElement.query(By.css('app-markdown-toolbar'));
        const buttonDe: any = toolbarDe.query(By.css(buttonName));
        buttonDe.nativeElement.click();

        fixture.detectChanges();
        fixture.whenStable().then(() => {
          const textBox: any = debugElement.query(By.css('textarea')).nativeElement;
          expect(textBox.value).toEqual(expectedMarkup);
        });
      });
    }
  });

  describe('all buttons in the formatting toolbar add the correct markups when some text is highlighted', () => {
    const highlightedText = 'abc';
    const highlightedTextStartPosition = 0;
    const highlightedTextEndPosition = 3;

    // key-value pair of button names and the formatting markups that they are supposed to
    // add to the text input box when clicked
    const buttonsToTest = {
      'md-bold': `**${highlightedText}**`,
      'md-italic': `_${highlightedText}_`,
      'md-header': `### ${highlightedText}`,
      'md-quote': `> ${highlightedText}`,
      'md-code': `\`${highlightedText}\``,
      'md-link': `[${highlightedText}](url)`,
      'md-image': `![${highlightedText}](url)`,
      'md-unordered-list': `- ${highlightedText}`,
      'md-ordered-list': `1. ${highlightedText}`,
      'md-task-list': `- [ ] ${highlightedText}`,
      'md-mention': `@${highlightedText}`,
      'md-ref': `#${highlightedText}`
    };

    // simulate each button being clicked and check that the markups added to the text
    // input box are correct
    for (const [buttonName, expectedMarkup] of Object.entries(buttonsToTest)) {
      it(`should add correct markups when the ${buttonName} button is pressed`, async () => {
        fixture.detectChanges();

        const textBoxDe: DebugElement = debugElement.query(By.css('textarea'));
        const toolbarDe: DebugElement = debugElement.query(By.css('app-markdown-toolbar'));
        const buttonDe: any = toolbarDe.query(By.css(buttonName));

        textBoxDe.nativeElement.value = highlightedText;
        textBoxDe.nativeElement.dispatchEvent(new Event('input'));

        textBoxDe.nativeElement.selectionStart = highlightedTextStartPosition;
        textBoxDe.nativeElement.selectionEnd = highlightedTextEndPosition;
        fixture.detectChanges();

        buttonDe.nativeElement.click();
        fixture.detectChanges();

        fixture.whenStable().then(() => {
          expect(textBoxDe.nativeElement.value).toEqual(expectedMarkup);
        });
      });
    }
  });

  describe('text input box', () => {
    it('should render', () => {
      fixture.detectChanges();

      const textBoxDe: DebugElement = debugElement.query(By.css('textarea'));
      expect(textBoxDe).toBeTruthy();
    });

    it('should contain an empty string if no initial description is provided', () => {
      fixture.detectChanges();

      const textBox: any = debugElement.query(By.css('textarea')).nativeElement;
      expect(textBox.value).toEqual('');
    });

    it('should contain an initial description if one is provided', () => {
      component.initialDescription = TEST_INITIAL_DESCRIPTION;
      fixture.detectChanges();

      const textBox: any = debugElement.query(By.css('textarea')).nativeElement;
      expect(textBox.value).toEqual(TEST_INITIAL_DESCRIPTION);
    });

    it('should allow users to input text', async () => {
      fixture.detectChanges();

      const textBox: any = debugElement.query(By.css('textarea')).nativeElement;
      textBox.value = '123';
      textBox.dispatchEvent(new Event('input'));

      fixture.whenStable().then(() => {
        expect(textBox.value).toEqual('123');
      });
    });
  });
});
