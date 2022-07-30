import { DebugElement, ElementRef } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MarkdownModule } from 'ngx-markdown';

import { ErrorHandlingService } from '../../../../src/app/core/services/error-handling.service';
import { LoggingService } from '../../../../src/app/core/services/logging.service';
import { UploadService } from '../../../../src/app/core/services/upload.service';
import { CommentEditorComponent } from '../../../../src/app/shared/comment-editor/comment-editor.component';
import { DISPLAYABLE_CONTENT, insertUploadingText, insertUploadUrl } from '../../../../src/app/shared/comment-editor/upload-text-insertor';
import { SharedModule } from '../../../../src/app/shared/shared.module';

function isDisplayable(filename) {
  return DISPLAYABLE_CONTENT.includes(filename.split('.').pop().toLowerCase());
}

describe('CommentEditorComponent', () => {
  describe('UploadTextInsertor functions', () => {
    let fixture: ComponentFixture<CommentEditorComponent>;
    let commentEditorComponent: CommentEditorComponent;
    let form: FormGroup;
    let commentField;
    let commentTextArea: ElementRef<HTMLTextAreaElement>;
    let textAreaEl: HTMLTextAreaElement;

    const uploadService = jasmine.createSpyObj(['isVideoFile', 'isSupportedFileType', 'uploadFile']);
    const errorHandlingService = jasmine.createSpyObj(['handleError']);
    const logger = jasmine.createSpyObj(['info']);

    const uploadTextTemplate = (filename) => `${isDisplayable(filename) ? '!' : ''}[Uploading ${filename}...]\n`;
    const uploadUrlTemplate = (filename, uploadUrl) => `${isDisplayable(filename) ? '!' : ''}[${filename}](${uploadUrl})\n`;
    const testDisplayableFilename = 'test_file.jpg';
    const testFilename = 'test_file.pdf';
    const testUrl = 'testurl.com/test';

    beforeEach(async(() => {
      TestBed.configureTestingModule({
        imports: [SharedModule, MarkdownModule.forChild(), BrowserAnimationsModule],
        declarations: [CommentEditorComponent],
        providers: [
          { provide: UploadService, useValue: uploadService },
          { provide: ErrorHandlingService, useValue: errorHandlingService },
          { provide: LoggingService, useValue: logger }
        ]
      }).compileComponents();
    }));

    beforeEach(() => {
      fixture = TestBed.createComponent(CommentEditorComponent);
      form = new FormGroup({
        description: new FormControl('')
      });
      commentField = form.get('description');
      commentEditorComponent = fixture.componentInstance;
      // Set up compulsory input fields
      commentEditorComponent.commentField = commentField;
      commentEditorComponent.commentForm = form;
      commentEditorComponent.id = 'description';

      commentTextArea = commentEditorComponent.commentTextArea;
      textAreaEl = commentTextArea.nativeElement;
      fixture.detectChanges();
    });

    it('should set up correctly', () => {
      expect(fixture).toBeDefined();
      expect(commentTextArea).toBeDefined();
      expect(commentField).toBeDefined();
    });

    describe('insertUploadingText', () => {
      describe('should set the correct value in the commentField', () => {
        it('should insert a ! for displayable files', () => {
          const expected = uploadTextTemplate(testDisplayableFilename);
          insertUploadingText(testDisplayableFilename, commentField, commentTextArea);
          expect(commentField.value).toBe(expected);
        });

        it('should not insert a ! for non-displayable files', () => {
          const expected = uploadTextTemplate(testFilename);
          insertUploadingText(testFilename, commentField, commentTextArea);
          expect(commentField.value).toBe(expected);
        });
      });

      it("should reposition the cursor by the uploading text's length", () => {
        const initialPosition = textAreaEl.selectionEnd;
        const expected = uploadTextTemplate(testDisplayableFilename);
        insertUploadingText(testDisplayableFilename, commentField, commentTextArea);
        expect(textAreaEl.selectionEnd).toBe(expected.length + initialPosition);
      });
    });

    describe('insertUploadUrl', () => {
      beforeEach(() => {
        insertUploadingText(testDisplayableFilename, commentField, commentTextArea);
      });

      it('should replace the uploading text with the filename and link', () => {
        insertUploadUrl(testDisplayableFilename, testUrl, commentField, commentTextArea);
        const expected = uploadUrlTemplate(testDisplayableFilename, testUrl);
        expect(commentField.value).toBe(expected);
      });

      describe('should position the cursor', () => {
        const dummyText = 'dummyText';

        it('should reposition to the end of the upload url if cursor is within the uploading text', () => {
          insertUploadUrl(testDisplayableFilename, testUrl, commentField, commentTextArea);
          const expected = uploadUrlTemplate(testDisplayableFilename, testUrl);
          expect(textAreaEl.selectionEnd).toBe(expected.length);
        });

        it('should not reposition if the cursor is before the uploading text', () => {
          // Insert text before the upload text and position cursor at the start
          const startOfField = 0;
          commentField.setValue(`${dummyText}${commentField.value}`);
          textAreaEl.setSelectionRange(startOfField, startOfField);
          insertUploadUrl(testDisplayableFilename, testUrl, commentField, commentTextArea);
          expect(textAreaEl.selectionEnd).toBe(startOfField);
        });

        it('should reposition the cursor by the difference in length if cursor is after the uploading text', () => {
          // Insert text after the upload text and position cursor at the end
          commentField.setValue(`${commentField.value}${dummyText}`);
          const endOfField = commentField.value.length;
          textAreaEl.setSelectionRange(endOfField, endOfField);
          insertUploadUrl(testDisplayableFilename, testUrl, commentField, commentTextArea);
          const updatedEndOfField = commentField.value.length;
          expect(textAreaEl.selectionEnd).toBe(updatedEndOfField);
        });
      });
    });
  });
});
