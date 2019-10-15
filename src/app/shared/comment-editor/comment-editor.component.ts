import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {AbstractControl, FormGroup} from '@angular/forms';
import {UploadService} from '../../core/services/upload.service';
import {ErrorHandlingService} from '../../core/services/error-handling.service';
import {clipboard} from 'electron';

const DISPLAYABLE_CONTENT = ['gif', 'jpeg', 'jpg', 'png'];
const MAX_UPLOAD_SIZE = 10000000; // 10MB

@Component({
  selector: 'app-comment-editor',
  templateUrl: './comment-editor.component.html',
  styleUrls: ['./comment-editor.component.css'],
})
export class CommentEditorComponent implements OnInit {
  constructor(private uploadService: UploadService,
              private errorHandlingService: ErrorHandlingService) {}

  @Input() commentField: AbstractControl; // Compulsory Input
  @Input() commentForm: FormGroup; // Compulsory Input
  @Input() id: string; // Compulsory Input
  @Input() initialDescription?: string;
  @ViewChild('dropArea') dropArea;
  @ViewChild('commentTextArea') commentTextArea;
  @ViewChild('markdownArea') markdownArea;

  dragActiveCounter = 0;
  uploadErrorMessage: string;

  ngOnInit() {
    if (this.initialDescription !== undefined) {
      this.commentField.setValue(this.initialDescription);
    }

    if (this.commentField === undefined || this.commentForm === undefined || this.id === undefined) {
      throw new Error('Comment Editor\'s compulsory properties are not defined.');
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
    if (files.length > 0) {
      this.readAndUploadFile(files[0]);
      this.commentTextArea.nativeElement.focus();
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

  readAndUploadFile(file: File): void {
    this.uploadErrorMessage = null;
    const reader = new FileReader();
    const filename = file.name;
    const insertedText = this.insertUploadingText(filename);

    if (file.size >= MAX_UPLOAD_SIZE) {
      this.handleUploadError('Oops, file is too big. Keep it under 10MB.', insertedText);
      return;
    }

    reader.onload = () => {
      this.uploadService.uploadFile(reader.result, filename).subscribe((response) => {
        this.insertUploadUrl(filename, response.data.content.download_url);
      }, (error) => {
        this.handleUploadError(error, insertedText);
      });
    };
    reader.readAsDataURL(file);
  }

  /**
   * Formats the text to create space at the end of the user input to prevent any issues with
   * the markdown interpretation.
   */
  formatText() {
    const newLinesRegex = /[\n\r]/gi;
    if (this.commentTextArea.nativeElement.value.split(newLinesRegex).filter(split => split.trim() !== '').length > 0) {
      this.commentField.setValue(this.commentTextArea.nativeElement.value + '\n\r');
    } else {
      this.commentField.setValue('');
    }
  }

  onPaste() {
    this.uploadErrorMessage = null;

    const imageFileType = clipboard.availableFormats().filter(type => type.includes('image'));
    if (imageFileType.length === 0) {
      return;
    }

    const filename = `image.${imageFileType[0].split('/')[1]}`;
    const insertedText = this.insertUploadingText(filename);

    this.uploadService.uploadFile(clipboard.readImage().toDataURL(), filename).subscribe((response) => {
      this.insertUploadUrl(filename, response.data.content.download_url);
    }, (error) => {
      this.handleUploadError(error, insertedText);
    });
  }

  get isInErrorState(): boolean {
    return !!this.uploadErrorMessage;
  }

  private handleUploadError(error, insertedText: string) {
    if (error.constructor.name === 'HttpError') {
      this.errorHandlingService.handleHttpError(error);
      this.uploadErrorMessage = 'Something went wrong while uploading your file. Please try again.';
    } else {
      this.uploadErrorMessage = error;
    }
    this.commentField.setValue(this.commentField.value.replace(insertedText, ''));
  }

  private insertUploadingText(filename: string): string {
    const originalDescription = this.commentField.value;

    const fileType = filename.split('.').pop();
    let toInsert: string;
    if (DISPLAYABLE_CONTENT.includes(fileType)) {
      toInsert = `![Uploading ${filename}...]()\n`;
    } else {
      toInsert = `[Uploading ${filename}...]()\n`;
    }

    const cursorPosition = this.commentTextArea.nativeElement.selectionEnd;
    const endOfLineIndex = originalDescription.indexOf('\n', cursorPosition);
    const nextCursorPosition = cursorPosition + toInsert.length;

    if (endOfLineIndex === -1) {
      if (this.commentField.value === '') {
        this.commentField.setValue(toInsert);
      } else {
        this.commentField.setValue(`${this.commentField.value}\n${toInsert}`);
      }
    } else {
      const startTillNewline = originalDescription.slice(0, endOfLineIndex + 1);
      const newlineTillEnd = originalDescription.slice(endOfLineIndex);
      this.commentField.setValue(`${startTillNewline + toInsert + newlineTillEnd}`);
    }

    this.commentTextArea.nativeElement.setSelectionRange(nextCursorPosition, nextCursorPosition);
    return toInsert;
  }

  private insertUploadUrl(filename: string, uploadUrl: string) {
    const cursorPosition = this.commentTextArea.nativeElement.selectionEnd;
    const startIndexOfString = this.commentField.value.indexOf(`[Uploading ${filename}...]()`);
    const endIndexOfString = startIndexOfString + `[Uploading ${filename}...]()`.length;
    const endOfInsertedString = startIndexOfString + `[${filename}](${uploadUrl})`.length;

    this.commentField.setValue(
      this.commentField.value.replace(`[Uploading ${filename}...]()`, `[${filename}](${uploadUrl})`));

    if (cursorPosition > startIndexOfString - 1 && cursorPosition <= endIndexOfString) { // within the range of uploading text
      this.commentTextArea.nativeElement.setSelectionRange(endOfInsertedString, endOfInsertedString);
    } else {
      this.commentTextArea.nativeElement.setSelectionRange(cursorPosition, cursorPosition);
    }
  }

  private removeHighlightBorderStyle() {
    this.dragActiveCounter--;
    if (this.dragActiveCounter === 0) { // To make sure when dragging over a child element, drop area is still highlight.
      this.dropArea.nativeElement.classList.remove('highlight-drag-box');
      this.dropArea.nativeElement.classList.remove('highlight-drag-box-disabled');
    }
  }
}
