import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { AbstractControl, FormGroup, Validators } from '@angular/forms';
import * as DOMPurify from 'dompurify';
import { ErrorHandlingService } from '../../core/services/error-handling.service';
import { LoggingService } from '../../core/services/logging.service';
import { FILE_TYPE_SUPPORT_ERROR, getSizeExceedErrorMsg, SUPPORTED_FILE_TYPES, UploadService } from '../../core/services/upload.service';
import { insertUploadingText, insertUploadUrl, insertUploadUrlVideo } from './upload-text-insertor';

const BYTES_PER_MB = 1024 * 1024;
const SHOWN_MAX_UPLOAD_SIZE_MB = 10;
const SHOWN_MAX_VIDEO_UPLOAD_SIZE_MB = 5;
const TIME_BETWEEN_UPLOADS_MS = 250;

const MAX_UPLOAD_SIZE = (SHOWN_MAX_UPLOAD_SIZE_MB + 1) * BYTES_PER_MB; // 11MB to allow 10.x MB
const MAX_VIDEO_UPLOAD_SIZE = (SHOWN_MAX_VIDEO_UPLOAD_SIZE_MB + 1) * BYTES_PER_MB; // 6MB to allow 5.x MB
const ISSUE_BODY_SIZE_LIMIT = 40000;

const SPACE = ' ';

@Component({
  selector: 'app-comment-editor',
  templateUrl: './comment-editor.component.html',
  styleUrls: ['./comment-editor.component.css']
})
export class CommentEditorComponent implements OnInit {
  readonly SUPPORTED_FILE_TYPES = SUPPORTED_FILE_TYPES;

  constructor(private uploadService: UploadService, private errorHandlingService: ErrorHandlingService, private logger: LoggingService) {}

  @Input() commentField: AbstractControl; // Compulsory Input
  @Input() commentForm: FormGroup; // Compulsory Input
  @Input() id: string; // Compulsory Input

  @Input() initialDescription?: string;
  placeholderText = 'No details provided.';

  // Allows the comment editor to control the overall form's completeness.
  @Input() isFormPending?: boolean;
  @Output() isFormPendingChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  // Allow the comment editor to control the text of the submit button to prompt the user.
  @Input() submitButtonText?: string;
  @Output() submitButtonTextChange: EventEmitter<string> = new EventEmitter<string>();

  initialSubmitButtonText: string;
  lastUploadingTime: string;

  @ViewChild('dropArea', { static: true }) dropArea;
  @ViewChild('commentTextArea', { static: true }) commentTextArea;
  @ViewChild('markdownArea') markdownArea;

  dragActiveCounter = 0;
  uploadErrorMessage: string;
  maxLength = ISSUE_BODY_SIZE_LIMIT;

  formatFileUploadingButtonText(currentButtonText: string) {
    return currentButtonText + ' (Waiting for File Upload to finish...)';
  }

  ngOnInit() {
    if (this.initialDescription !== undefined) {
      this.commentField.setValue(this.initialDescription);
    }

    if (this.commentField === undefined || this.commentForm === undefined || this.id === undefined) {
      throw new Error("Comment Editor's compulsory properties are not defined.");
    }

    this.initialSubmitButtonText = this.submitButtonText;
    this.commentField.setValidators([Validators.maxLength(this.maxLength)]);
  }

  onKeyPress(event) {
    if (this.isControlKeyPressed(event)) {
      switch (event.key) {
        case 'b':
          event.preventDefault();
          this.insertOrRemoveCharsFromHighlightedText('**');
          break;
        case 'i':
          event.preventDefault();
          this.insertOrRemoveCharsFromHighlightedText('_');
          break;
        default:
          return;
      }
    }
  }

  onDragEnter(event) {
    event.preventDefault();
    event.stopPropagation();

    this.dragActiveCounter++;
    if (this.commentField.disabled) {
      this.dropArea.nativeElement.classList.add('highlight-drag-box-disabled');
    } else {
      this.dropArea.nativeElement.classList.add('highlight-drag-box');
    }
  }

  // Prevent cursor in textarea from moving when file is dragged over it.
  disableCaretMovement(event) {
    event.preventDefault();
  }

  // Sanitize markdown
  sanitize(commentFieldValue) {
    return DOMPurify.sanitize(commentFieldValue);
  }

  // To enable file drop in non-input elements, the dragOver event must be cancelled.
  enableFileDrop(event) {
    event.preventDefault();
  }

  onDrop(event) {
    event.preventDefault();
    event.stopPropagation();
    this.removeHighlightBorderStyle();

    if (this.commentField.disabled) {
      return;
    }

    const files = event.dataTransfer.files;

    if (files === undefined || files.length <= 0) {
      return;
    }

    this.commentTextArea.nativeElement.focus();

    for (let i = 0; i < files.length; i++) {
      setTimeout(() => {
        this.logger.info(`CommentEditorComponent: File ${i + 1} of ${files.length}. Begin uploading ${files[i].name}.`);
        this.readAndUploadFile(files[i]);
      }, TIME_BETWEEN_UPLOADS_MS * i);
    }
  }

  onDragExit(event) {
    event.preventDefault();
    event.stopPropagation();

    this.removeHighlightBorderStyle();
  }

  onFileInputUpload(event, fileInput) {
    event.preventDefault();
    event.stopPropagation();

    const files = fileInput.files;
    if (files.length > 0) {
      this.readAndUploadFile(files[0]);
      fileInput.value = '';
    }
  }

  updateParentFormsSubmittability(isFormPending: boolean, submitButtonText: string) {
    this.isFormPendingChange.emit(isFormPending);
    this.submitButtonTextChange.emit(submitButtonText);
  }

  readAndUploadFile(file: File): void {
    this.uploadErrorMessage = null;
    const reader = new FileReader();
    const filename = file.name;
    const insertedText = insertUploadingText(filename, this.commentField, this.commentTextArea);

    if (file.size >= MAX_UPLOAD_SIZE) {
      this.handleUploadError(getSizeExceedErrorMsg('file', SHOWN_MAX_UPLOAD_SIZE_MB), insertedText);
      return;
    }

    if (this.uploadService.isVideoFile(filename) && file.size >= MAX_VIDEO_UPLOAD_SIZE) {
      this.handleUploadError(getSizeExceedErrorMsg('video', SHOWN_MAX_VIDEO_UPLOAD_SIZE_MB), insertedText);
      return;
    }

    if (!this.uploadService.isSupportedFileType(filename)) {
      this.handleUploadError(FILE_TYPE_SUPPORT_ERROR, insertedText);
      return;
    }

    // Log the most recent upload.
    this.lastUploadingTime = new Date().getTime().toString();
    const currentFileUploadTime = this.lastUploadingTime;

    // Prevents Form Submission during Upload
    this.updateParentFormsSubmittability(true, this.formatFileUploadingButtonText(this.initialSubmitButtonText));

    reader.onload = () => {
      this.uploadService.uploadFile(reader.result, filename).subscribe(
        (response) => {
          if (this.uploadService.isVideoFile(filename)) {
            insertUploadUrlVideo(filename, response.data.content.download_url, this.commentField, this.commentTextArea);
          } else {
            insertUploadUrl(filename, response.data.content.download_url, this.commentField, this.commentTextArea);
          }
        },
        (error) => {
          this.handleUploadError(error, insertedText);
          // Allow button enabling if this is the last file that was uploaded.
          if (currentFileUploadTime === this.lastUploadingTime) {
            this.updateParentFormsSubmittability(false, this.initialSubmitButtonText);
          }
        },
        () => {
          // Allow button enabling if this is the last file that was uploaded.
          if (currentFileUploadTime === this.lastUploadingTime) {
            this.updateParentFormsSubmittability(false, this.initialSubmitButtonText);
          }
        }
      );
    };
    reader.readAsDataURL(file);
  }

  onPaste(event) {
    const items = event.clipboardData.items;
    let blob = null;
    for (const item of items) {
      if (item.type.indexOf('image') === 0) {
        blob = item.getAsFile();
        break;
      }
    }
    if (blob) {
      this.readAndUploadFile(blob);
    }
  }

  get isInErrorState(): boolean {
    return !!this.uploadErrorMessage;
  }

  private handleUploadError(error, insertedText: string) {
    if (error instanceof HttpErrorResponse) {
      this.errorHandlingService.handleError(error);
      this.uploadErrorMessage = 'Something went wrong while uploading your file. Please try again.';
    } else {
      this.uploadErrorMessage = error;
    }
    this.commentField.setValue(this.commentField.value.replace(insertedText, ''));
  }

  private removeHighlightBorderStyle() {
    this.dragActiveCounter--;
    if (this.dragActiveCounter === 0) {
      // To make sure when dragging over a child element, drop area is still highlight.
      this.dropArea.nativeElement.classList.remove('highlight-drag-box');
      this.dropArea.nativeElement.classList.remove('highlight-drag-box-disabled');
    }
  }

  private isControlKeyPressed(event) {
    if (navigator.platform.indexOf('Mac') === 0) {
      return event.metaKey;
    }
    return event.ctrlKey;
  }

  private insertOrRemoveCharsFromHighlightedText(char) {
    const selectionStart = this.commentTextArea.nativeElement.selectionStart;
    const selectionEnd = this.commentTextArea.nativeElement.selectionEnd;
    const currentText = this.commentField.value;
    const highlightedText = currentText.slice(selectionStart, selectionEnd);
    const highlightedTextTrimmed = highlightedText.trim();
    const spacesRemovedLeft = highlightedText.trimRight().length - highlightedTextTrimmed.length;
    const spacesRemovedRight = highlightedText.trimLeft().length - highlightedTextTrimmed.length;

    if (this.hasCharsBeforeAndAfterHighlight(selectionStart, selectionEnd, currentText, char)) {
      this.removeCharsBeforeAndAfterHighlightedText(selectionStart, selectionEnd, currentText, highlightedText, char);
    } else if (this.hasCharsInTrimmedHighlight(highlightedText, char)) {
      this.removeCharsFromHighlightedText(
        selectionStart,
        selectionEnd,
        currentText,
        highlightedTextTrimmed,
        char,
        spacesRemovedLeft,
        spacesRemovedRight
      );
    } else {
      this.insertCharsToHighlightedText(
        selectionStart,
        selectionEnd,
        currentText,
        highlightedTextTrimmed,
        char,
        spacesRemovedLeft,
        spacesRemovedRight
      );
    }
  }

  private hasCharsBeforeAndAfterHighlight(selectionStart, selectionEnd, currentText, char) {
    const hasInsertedCharBefore = currentText.slice(selectionStart - char.length, selectionStart) === char;
    const hasInsertedCharAfter = currentText.slice(selectionEnd, selectionEnd + char.length) === char;
    return hasInsertedCharBefore && hasInsertedCharAfter;
  }

  private hasCharsInTrimmedHighlight(highlightedText, char) {
    const highlightedTextTrimmed = highlightedText.trim();
    const hasCharAtFront = highlightedTextTrimmed.slice(0, char.length) === char;
    const hasCharAtEnd = highlightedTextTrimmed.slice(-char.length) === char;
    return hasCharAtFront && hasCharAtEnd;
  }

  private removeCharsBeforeAndAfterHighlightedText(selectionStart, selectionEnd, currentText, highlightedText, char) {
    this.commentField.setValue(
      currentText.slice(0, selectionStart - char.length) + highlightedText + currentText.slice(selectionEnd + char.length)
    );
    this.commentTextArea.nativeElement.setSelectionRange(selectionStart - char.length, selectionEnd - char.length);
  }

  private removeCharsFromHighlightedText(
    selectionStart,
    selectionEnd,
    currentText,
    highlightedTextTrimmed,
    char,
    spacesRemovedLeft,
    spacesRemovedRight
  ) {
    this.commentField.setValue(
      currentText.slice(0, selectionStart) +
        SPACE.repeat(spacesRemovedLeft) +
        highlightedTextTrimmed.slice(char.length, -char.length) +
        SPACE.repeat(spacesRemovedRight) +
        currentText.slice(selectionEnd)
    );
    this.commentTextArea.nativeElement.setSelectionRange(
      selectionStart + spacesRemovedLeft,
      selectionEnd - 2 * char.length - spacesRemovedRight
    );
  }

  private insertCharsToHighlightedText(
    selectionStart,
    selectionEnd,
    currentText,
    highlightedTextTrimmed,
    char,
    spacesRemovedLeft,
    spacesRemovedRight
  ) {
    this.commentField.setValue(
      currentText.slice(0, selectionStart) +
        SPACE.repeat(spacesRemovedLeft) +
        char +
        highlightedTextTrimmed +
        char +
        SPACE.repeat(spacesRemovedRight) +
        currentText.slice(selectionEnd)
    );
    this.commentTextArea.nativeElement.setSelectionRange(
      selectionStart + char.length + spacesRemovedLeft,
      selectionEnd + char.length - spacesRemovedRight
    );
  }
}
