import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormGroup, Validators } from '@angular/forms';
import { UndoRedo } from '../../../core/models/undoredo.model';

const ISSUE_BODY_SIZE_LIMIT = 256;

type textEntry = {
  text: string;
  selectStart: number;
  selectEnd: number;
};

@Component({
  selector: 'app-title-editor',
  templateUrl: './title-editor.component.html',
  styleUrls: ['./title-editor.component.css']
})
export class TitleEditorComponent implements OnInit {

  constructor() {}

  @Input() titleField: AbstractControl; // Compulsory Input
  @Input() titleForm: FormGroup; // Compulsory Input
  @Input() id: string; // Compulsory Input

  @Input() initialTitle?: string;
  placeholderText = 'Title';

  @ViewChild('titleInput', { static: true }) titleInput: ElementRef<HTMLInputElement>;

  maxLength = ISSUE_BODY_SIZE_LIMIT;

  history: UndoRedo<textEntry>;

  ngOnInit() {
    if (this.initialTitle !== undefined) {
      this.titleField.setValue(this.initialTitle);
    }

    if (this.titleField === undefined || this.titleForm === undefined || this.id === undefined) {
      throw new Error("Title Editor's compulsory properties are not defined.");
    }

    this.titleField.setValidators([Validators.required, Validators.maxLength(this.maxLength)]);
    this.history = new UndoRedo<textEntry>(
      75,
      () => {
        return {
          text: this.titleInput.nativeElement.value,
          selectStart: this.titleInput.nativeElement.selectionStart,
          selectEnd: this.titleInput.nativeElement.selectionEnd
        };
      },
      500
    );
  }

  onKeyPress(event: KeyboardEvent) {
    if (UndoRedo.isUndo(event)) {
      event.preventDefault();
      this.undo();
      return;
    } else if (UndoRedo.isRedo(event)) {
      this.redo();
      event.preventDefault();
      return;
    }
  }

  handleBeforeInputChange(event: InputEvent): void {
    switch (event.inputType) {
      case 'historyUndo':
      case 'historyRedo':
        // ignore these events that doesn't modify the text
        event.preventDefault();
        break;
      case 'insertFromPaste':
        this.history.forceSave(null, true, false);
        break;

      default:
        this.history.updateBeforeChange();
    }
  }

  handleInputChange(event: InputEvent): void {
    switch (event.inputType) {
      case 'historyUndo':
      case 'historyRedo':
        // ignore these events that doesn't modify the text
        event.preventDefault();
        break;
      case 'insertFromPaste':
        // paste events will be handled exclusively by handleBeforeInputChange
        break;

      default:
        this.history.createDelayedSave();
    }
  }

  private undo(): void {
    const entry = this.history.undo();
    if (entry === null) {
      return;
    }
    this.titleField.setValue(entry.text);
    this.titleInput.nativeElement.setSelectionRange(entry.selectStart, entry.selectEnd);
  }

  private redo(): void {
    const entry = this.history.redo();
    if (entry === null) {
      return;
    }
    this.titleInput.nativeElement.value = entry.text;
    this.titleInput.nativeElement.setSelectionRange(entry.selectStart, entry.selectEnd);
  }
}
