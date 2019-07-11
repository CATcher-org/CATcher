import { Component, OnInit } from '@angular/core';
import {ACTION_BUTTONS} from '../../shared/issue-tables/issue-tables.component';

@Component({
  selector: 'app-issue-pending',
  templateUrl: './issue-pending.component.html',
  styleUrls: ['./issue-pending.component.css']
})
export class IssuePendingComponent implements OnInit {

  readonly displayedColumns: string[] = ['id', 'title', 'type', 'severity', 'actions'];
  readonly actionButtons: ACTION_BUTTONS[] = [ACTION_BUTTONS.VIEW_IN_WEB, ACTION_BUTTONS.RESPOND_TO_ISSUE,
    ACTION_BUTTONS.MARK_AS_RESPONDED];

  constructor() { }

  ngOnInit() {
  }

}
