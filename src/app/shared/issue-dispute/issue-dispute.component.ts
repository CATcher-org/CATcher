import { Component, OnInit, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { Issue, STATUS } from '../../core/models/issue.model';
import { IssueComment } from '../../core/models/comment.model';
import { CommentEditorComponent } from '../comment-editor/comment-editor.component';
import { IssueService } from '../../core/services/issue.service';
import { IssueCommentService } from '../../core/services/issue-comment.service';
import { UserService } from '../../core/services/user.service';
import { ErrorHandlingService } from '../../core/services/error-handling.service';
import { finalize } from 'rxjs/operators';
import { UserRole } from '../../core/models/user.model';

@Component({
  selector: 'app-issue-dispute',
  templateUrl: './issue-dispute.component.html',
  styleUrls: ['./issue-dispute.component.css']
})
export class IssueDisputeComponent implements OnInit {
  tutorResponseForm: FormGroup;
  isFormPending = false;
  isEditing = false;

  @Input() issue: Issue;
  @Input() issueComment: IssueComment;
  @Output() issueUpdated = new EventEmitter<Issue>();
  @Output() commentUpdated = new EventEmitter<IssueComment>();
  @ViewChild(CommentEditorComponent) commentEditor: CommentEditorComponent;

  constructor(private formBuilder: FormBuilder,
              private issueService: IssueService,
              private issueCommentService: IssueCommentService,
              public userService: UserService,
              private errorHandlingService: ErrorHandlingService) { }

  ngOnInit() {
    const group: any = {};
    for (let i = 0; i < this.issue.issueDisputes.length; i++) {
      group[i.toString()] = new FormControl(Validators.required);
    }
    this.tutorResponseForm = this.formBuilder.group(group);

    if (this.isNewResponse()) {
      this.isEditing = true;
    }
  }

  submitTutorResponseForm() {
    if (this.tutorResponseForm.invalid) {
      return;
    }
    this.isFormPending = true;

    this.issue.pending = '' + this.getNumOfPending();
    this.issue.todoList = this.getToDoList();

    // Update tutor's response in the issue comment
    if (this.issueComment) {
      this.issueComment.description = this.issueCommentService.
        createGithubTutorResponse(this.issue.issueDisputes);

      this.issueCommentService.updateIssueComment(this.issueComment).subscribe(
        (updatedComment) => {
          this.isFormPending = false;
          this.isEditing = false;
          this.issueComment = updatedComment;
          this.commentUpdated.emit(updatedComment);
        }, (error) => {
          this.errorHandlingService.handleHttpError(error);
      });
    } else {
      const issueCommentDescription = this.issueCommentService
        .createGithubTutorResponse(this.issue.issueDisputes);

      this.issueCommentService.createIssueComment(this.issue.id, issueCommentDescription).subscribe(
        (updatedComment) => {
          this.isFormPending = false;
          this.isEditing = false;
          this.issueComment = updatedComment;
          this.commentUpdated.emit(updatedComment);
        },
        (error) => {
          this.errorHandlingService.handleHttpError(error);
      });
    }

    this.issueService.updateIssue(this.issue).subscribe(
      (updatedIssue) => {
        this.issueUpdated.emit(updatedIssue);
      },
      (error) => {
        this.errorHandlingService.handleHttpError(error);
      });
  }

  changeToEditMode() {
    this.isEditing = true;
  }

  cancelEditMode() {
    this.isEditing = false;
  }

  handleChangeOfText(event, disagree, index) {
    if (event.target.value !== disagree) {
      this.issue.issueDisputes[index].tutorResponse = event.target.value;
    }
  }

  handleChangeOfTodoCheckbox(event, todo, index) {
    if (event.checked) {
      this.issue.issueDisputes[index].todo = '- [x]' + todo.substring(5);
    } else {
      this.issue.issueDisputes[index].todo = '- [ ]' + todo.substring(5);
    }
  }

  isTodoChecked(todo): boolean {
    return todo.charAt(3) === 'x';
  }

  trackDisputeList(index: number, item: string[]): string {
    return item[index];
  }

  isNewResponse(): boolean {
    return !this.issueComment;
  }

  getSubmitButtonText(): string {
    return this.isNewResponse() ? 'Submit' : 'Save';
  }

  getItemTitleText(title: string): string {
    return '## ' + title;
  }

  getToDoList(): string[] {
    const toDoList: string[] = [];
    for (const issueDispute of this.issue.issueDisputes) {
      toDoList.push(issueDispute.todo);
    }
    return toDoList;
  }

  getNumOfPending(): number {
    let pending = this.issue.issueDisputes.length; // Initial pending is number of disputes
    for (const issueDispute of this.issue.issueDisputes) {
      // For each number of Done that is checked, reduce pending by one
      if (this.isTodoChecked(issueDispute.todo)) {
        pending--;
      }
    }
    return pending;
  }
}
