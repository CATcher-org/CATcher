import { DebugElement, ElementRef } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MarkdownModule } from 'ngx-markdown';

import { ErrorHandlingService } from '../../../../src/app/core/services/error-handling.service';
import { LoggingService } from '../../../../src/app/core/services/logging.service';
import { UploadService } from '../../../../src/app/core/services/upload.service';
import { CommentEditorComponent } from '../../../../src/app/shared/comment-editor/comment-editor.component';
import {
  DISPLAYABLE_CONTENT,
  insertUploadingText,
  insertUploadUrl,
  insertUploadUrlVideo
} from '../../../../src/app/shared/comment-editor/upload-text-insertor';
import { SharedModule } from '../../../../src/app/shared/shared.module';

function isDisplayable(filename) {
  return DISPLAYABLE_CONTENT.includes(filename.split('.').pop().toLowerCase());
}

describe('UploadTextInsertor', () => {
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
  const uploadVideoTemplate = (uploadUrl) =>
    `<i><video controls><source src="${uploadUrl}" type="video/mp4">Your browser does not support the video tag.</video><br>video:${uploadUrl}</i>\n`;

  const testDisplayableFilename = 'test_file.jpg';
  const testFilename = 'test_file.pdf';
  const testVideo = 'test_vid.mp4';
  const testUrl = 'testurl.com/test';
  const dummyText = 'dummyText';

  beforeEach(waitForAsync(() => {
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

  describe('replacePlaceholderString', () => {
    beforeEach(() => {
      insertUploadingText(testDisplayableFilename, commentField, commentTextArea);
    });

    describe('should position the cursor', () => {
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

  describe('insertUploadUrl', () => {
    beforeEach(() => {
      insertUploadingText(testDisplayableFilename, commentField, commentTextArea);
    });

    it('should replace the uploading text with the filename and link', () => {
      insertUploadUrl(testDisplayableFilename, testUrl, commentField, commentTextArea);
      const expected = uploadUrlTemplate(testDisplayableFilename, testUrl);
      expect(commentField.value).toBe(expected);
    });

    it('should replace only the uploading text, leaving the rest of the field unchanged', () => {
      // insert dummy text before and after, should remain unchanged
      commentField.setValue(`${dummyText}${commentField.value}${dummyText}`);
      insertUploadUrl(testDisplayableFilename, testUrl, commentField, commentTextArea);
      const expected = `${dummyText}${uploadUrlTemplate(testDisplayableFilename, testUrl)}${dummyText}`;
      expect(commentField.value).toBe(expected);
    });
  });

  describe('insertUploadUrlVideo', () => {
    beforeEach(() => {
      insertUploadingText(testVideo, commentField, commentTextArea);
    });

    it('should replace the uploading text with the correct HTML text', () => {
      insertUploadUrlVideo(testVideo, testUrl, commentField, commentTextArea);
      const expected = uploadVideoTemplate(testUrl);
      expect(commentField.value).toBe(expected);
    });
  });
});
