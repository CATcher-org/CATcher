import { Component, OnInit } from '@angular/core';
import { ACTION_BUTTONS } from '../../shared/issue-tables/issue-tables.component';

@Component({
  selector: 'app-issues-pending',
  templateUrl: './issues-pending.component.html',
  styleUrls: ['./issues-pending.component.css']
})
export class IssuesPendingComponent implements OnInit {

  private displayedColumns: string[] = ['id', 'title', 'type', 'severity', 'actions'];
  private actionButtons: ACTION_BUTTONS[] = [ACTION_BUTTONS.VIEW_IN_WEB];

  constructor() { }

  ngOnInit() {
  }

}
