import {Component, Input, OnInit} from '@angular/core';
import {AbstractControl, FormGroup} from '@angular/forms';

@Component({
  selector: 'app-comment-editor',
  templateUrl: './comment-editor.component.html',
  styleUrls: ['./comment-editor.component.css']
})
export class CommentEditorComponent implements OnInit {
  constructor() {}

  @Input() commentField: AbstractControl;
  @Input() commentForm: FormGroup;

  ngOnInit() {}
}
