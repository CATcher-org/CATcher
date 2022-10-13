import { CUSTOM_ELEMENTS_SCHEMA, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Apollo } from 'apollo-angular';
import { MarkdownModule } from 'ngx-markdown';

import { CommentEditorComponent } from '../../../../src/app/shared/comment-editor/comment-editor.component';
import { SharedModule } from '../../../../src/app/shared/shared.module';

describe('CommentEditor', () => {
  let fixture: ComponentFixture<CommentEditorComponent>;
  let debugElement: DebugElement;
  let component: CommentEditorComponent;

  const TEST_INITIAL_DESCRIPTION = 'abc';
  const TEST_SUBMIT_BUTTON_TEXT = 'Submit';

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CommentEditorComponent],
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

    // manually inject inputs into component
    component.commentField = commentField;
    component.commentForm = commentForm;
    component.id = id;
    component.submitButtonText = TEST_SUBMIT_BUTTON_TEXT;
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
