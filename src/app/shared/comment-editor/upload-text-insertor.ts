import { ElementRef } from '@angular/core';
import { AbstractControl } from '@angular/forms';

const DISPLAYABLE_CONTENT = ['gif', 'jpeg', 'jpg', 'png'];

export function insertUploadingText(
  filename: string,
  commentField: AbstractControl,
  commentTextArea: ElementRef<HTMLTextAreaElement>
): string {
  const originalDescription = commentField.value;

  const fileType = filename.split('.').pop();
  let toInsert: string;
  if (DISPLAYABLE_CONTENT.includes(fileType.toLowerCase())) {
    toInsert = `![Uploading ${filename}...]\n`;
  } else {
    toInsert = `[Uploading ${filename}...]\n`;
  }

  const cursorPosition = commentTextArea.nativeElement.selectionEnd;
  const endOfLineIndex = originalDescription.indexOf('\n', cursorPosition);
  const nextCursorPosition = cursorPosition + toInsert.length;

  if (endOfLineIndex === -1) {
    if (commentField.value === '') {
      commentField.setValue(toInsert);
    } else {
      commentField.setValue(`${commentField.value}\n${toInsert}`);
    }
  } else {
    const startTillNewline = originalDescription.slice(0, endOfLineIndex + 1);
    const newlineTillEnd = originalDescription.slice(endOfLineIndex);
    commentField.setValue(`${startTillNewline + toInsert + newlineTillEnd}`);
  }

  commentTextArea.nativeElement.setSelectionRange(nextCursorPosition, nextCursorPosition);
  return toInsert;
}

export function insertUploadUrlVideo(
  filename: string,
  uploadUrl: string,
  commentField: AbstractControl,
  commentTextArea: ElementRef<HTMLTextAreaElement>
) {
  const insertedString = `<i><video controls><source src="${uploadUrl}" type="video/mp4">Your browser does not support the video tag.</video><br>video:${uploadUrl}</i>`;

  replacePlaceholderString(filename, insertedString, commentField, commentTextArea);
}

export function insertUploadUrl(
  filename: string,
  uploadUrl: string,
  commentField: AbstractControl,
  commentTextArea: ElementRef<HTMLTextAreaElement>
) {
  const insertedString = `[${filename}](${uploadUrl})`;
  replacePlaceholderString(filename, insertedString, commentField, commentTextArea);
}

function replacePlaceholderString(
  filename: string,
  insertedString: string,
  commentField: AbstractControl,
  commentTextArea: ElementRef<HTMLTextAreaElement>
) {
  const cursorPosition = this.commentTextArea.nativeElement.selectionEnd;
  const insertingString = `[Uploading ${filename}...]`;
  const startIndexOfString = this.commentField.value.indexOf(insertingString);
  const endIndexOfString = startIndexOfString + insertingString.length;
  const endOfInsertedString = startIndexOfString + insertedString.length;
  const differenceInLength = endOfInsertedString - endIndexOfString;
  const newCursorPosition =
    cursorPosition > startIndexOfString - 1 && cursorPosition <= endIndexOfString // within the range of uploading text
      ? endOfInsertedString
      : cursorPosition < startIndexOfString // before the uploading text
      ? cursorPosition
      : cursorPosition + differenceInLength; // after the uploading text

  commentField.setValue(this.commentField.value.replace(insertingString, insertedString));
  commentTextArea.nativeElement.setSelectionRange(newCursorPosition, newCursorPosition);
}
