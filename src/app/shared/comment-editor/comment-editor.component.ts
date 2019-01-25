import {Component, Inject, Input, OnInit} from '@angular/core';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material';
import {AbstractControl, FormGroup} from '@angular/forms';

@Component({
  selector: 'app-comment-editor',
  templateUrl: './comment-editor.component.html',
})
export class CommentEditorComponent implements OnInit {
  constructor() {}

  @Input() commentField: AbstractControl;
  @Input() commentForm: FormGroup;

  ngOnInit() {}
}
