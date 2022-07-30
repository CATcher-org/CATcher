import { ElementRef } from '@angular/core';
import { AbstractControl } from '@angular/forms';

export const DISPLAYABLE_CONTENT = ['gif', 'jpeg', 'jpg', 'png'];

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

export function insertUploadUrl(
  filename: string,
  uploadUrl: string,
  commentField: AbstractControl,
  commentTextArea: ElementRef<HTMLTextAreaElement>
) {
  const cursorPosition = commentTextArea.nativeElement.selectionEnd;
  const startIndexOfString = commentField.value.indexOf(`[Uploading ${filename}...]`);
  const endIndexOfString = startIndexOfString + `[Uploading ${filename}...]`.length;
  const endOfInsertedString = startIndexOfString + `[${filename}](${uploadUrl})`.length;
  const differenceInLength = endOfInsertedString - endIndexOfString;
  const newCursorPosition =
    cursorPosition > startIndexOfString - 1 && cursorPosition <= endIndexOfString // within the range of uploading text
      ? endOfInsertedString
      : cursorPosition < startIndexOfString // before the uploading text
      ? cursorPosition
      : cursorPosition + differenceInLength; // after the uploading text

  commentField.setValue(commentField.value.replace(`[Uploading ${filename}...]`, `[${filename}](${uploadUrl})`));

  commentTextArea.nativeElement.setSelectionRange(newCursorPosition, newCursorPosition);
}
