import { Component, OnInit } from '@angular/core';
import {ACTION_BUTTONS} from '../../shared/issue-tables/issue-tables.component';

@Component({
  selector: 'app-issue-responded',
  templateUrl: './issue-responded.component.html',
  styleUrls: ['./issue-responded.component.css']
})
export class IssueRespondedComponent implements OnInit {

  readonly displayedColumns: string[] = ['id', 'title', 'type', 'severity', 'actions'];
  readonly actionButtons: ACTION_BUTTONS[] = [ACTION_BUTTONS.VIEW_IN_WEB, ACTION_BUTTONS.MARK_AS_PENDING];
  constructor() { }

  ngOnInit() {
  }

}
