import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {AbstractControl, FormGroup} from '@angular/forms';
import {UploadService} from '../../core/services/upload.service';
import {ErrorHandlingService} from '../../core/services/error-handling.service';

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

  @Input() commentField: AbstractControl;
  @Input() commentForm: FormGroup;
  @ViewChild('dropArea') dropArea;
  @ViewChild('commentTextArea') commentTextArea;
  @ViewChild('markdownArea') markdownArea;

  dragActiveCounter = 0;
  cursorPosition = 0;
  uploadErrorMessage: string;

  ngOnInit() {}

  onDragEnter(event) {
    event.preventDefault();
    event.stopPropagation();

    this.dragActiveCounter++;
    this.dropArea.nativeElement.classList.add('highlight-drag-box');

    if (this.commentField.touched) {
      this.cursorPosition = this.commentTextArea.nativeElement.selectionEnd;
    } else {
      this.cursorPosition = 0;
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
    const files = event.dataTransfer.files;

    if (files.length > 0) {
      this.readAndUploadFile(files[0]);
      this.removeHighlightBorderStyle();
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
      this.uploadService.uploadImage(reader.result, filename).subscribe((response) => {
        this.insertUploadUrl(filename, response.data.content.download_url);
      }, (error) => {
        this.handleUploadError(error, insertedText);
      });
    };
    reader.readAsDataURL(file);
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
    const endOfLineIndex = originalDescription.indexOf('\n', this.cursorPosition);

    const fileType = filename.split('.')[1];
    let toInsert: string;
    if (DISPLAYABLE_CONTENT.includes(fileType)) {
      toInsert = `![Uploading ${filename}...]()\n`;
    } else {
      toInsert = `[Uploading ${filename}...]()\n`;
    }

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
    return toInsert;
  }

  private insertUploadUrl(filename: string, uploadUrl: string) {
    this.commentField.setValue(
      this.commentField.value.replace(`[Uploading ${filename}...]()`, `[${filename}](${uploadUrl})`));
  }

  private removeHighlightBorderStyle() {
    this.dragActiveCounter--;
    if (this.dragActiveCounter === 0) { // To make sure when dragging over a child element, drop area is still highlight.
      this.dropArea.nativeElement.classList.remove('highlight-drag-box');
    }
  }
}
