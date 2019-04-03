import {Component, EventEmitter, Input, OnInit, Output, ViewChild, ViewEncapsulation} from '@angular/core';
import {Issue} from "../../../core/models/issue.model";
import {IssueService} from "../../../core/services/issue.service";
import {MatSelect} from "@angular/material";

@Component({
  selector: 'app-todo-list',
  templateUrl: './todo-list.component.html',
  styleUrls: ['./todo-list.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class TodoListComponent implements OnInit {

  isInEditMode = false;

  @ViewChild(MatSelect) todoSelection: MatSelect;
  @Input() issue: Issue;
  @Output() issueUpdated = new EventEmitter<Issue>();

  constructor(private issueService: IssueService) { }

  ngOnInit() {
  }

  openSelector() {
    this.isInEditMode = true;
  }

  done() {
    this.isInEditMode = false;
    this.updateTodoList();
  }

  trackTodoList(index: number, item: string[]): string {
    return item[index];
  }

  isTodoChecked(index): boolean {
    if (this.issue.todoList[index].charAt(3) == 'x') {
      return true;
    }
    return false;
  }

  handleChangeOfTodoCheckbox(event, todo, index) {
    if (event.checked) {
      this.issue.todoList[index] = '- [x]' + todo.substring(5);
    } else {
      this.issue.todoList[index] = '- [ ]' + todo.substring(5);
    }
  }

  updateTodoList(): void {
    this.issueService.updateIssue({
      ...this.issue,
      todoList: this.issue.todoList
    }).subscribe((updatedIssue: Issue) => {
      this.issueUpdated.emit(updatedIssue);
    }, (error) => {
      console.log(error);
    });
  }

  get todoFinished(): number {
    let count = 0;
    if (!this.isTodoListExists) {
      return count;
    }

    for (const todo of this.issue.todoList) {
      if (todo.charAt(3) === 'x') {
        count += 1;
      }
    }
    return count;
  }

  get isTodoListExists(): boolean {
    return this.issue.todoList !== undefined;
  }

  get isTodoListChecked(): boolean {
    if (this.isTodoListExists && this.todoFinished === this.issue.todoList.length) {
      return true;
    }
    return false;
  }
}
