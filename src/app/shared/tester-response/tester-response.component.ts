import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { Issue } from '../../core/models/issue.model';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { CommentEditorComponent } from '../comment-editor/comment-editor.component';

@Component({
  selector: 'app-tester-response',
  templateUrl: './tester-response.component.html',
  styleUrls: ['./tester-response.component.css']
})
export class TesterResponseComponent implements OnInit {

  testerResponseForm: FormGroup;

  @Input() issue: Issue;
  @Output() issueUpdated = new EventEmitter<Issue>();
  @ViewChild(CommentEditorComponent) commentEditor: CommentEditorComponent;

  constructor(private formBuilder: FormBuilder) { }

  ngOnInit() {
    this.testerResponseForm = this.formBuilder.group({
      description: [''],
      testerResponse: [this.issue.testerResponses]
    });

  }

  handleChangeOfDisagreeCheckbox(event, disagree, index) {
    if (event.checked) {
      this.issue.testerResponses[index].disagreeCheckbox = '- [x]' + disagree.substring(5);
    } else {
      this.issue.testerResponses[index].disagreeCheckbox = '- [ ]' + disagree.substring(5);
    }
  }

  trackDisagreeList(index: number, item: string[]): string {
    return item[index];
  }

  isDisagreeChecked(disagree): boolean {
    if (disagree.charAt(3) === 'x') {
      return true;
    }
    return false;
  }

}
