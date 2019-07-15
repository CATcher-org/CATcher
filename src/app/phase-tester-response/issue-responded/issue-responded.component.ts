import {Component, OnInit, ViewChild} from '@angular/core';
import {ACTION_BUTTONS, IssueTablesComponent} from '../../shared/issue-tables/issue-tables.component';
import {Issue, STATUS} from '../../core/models/issue.model';

@Component({
  selector: 'app-issue-responded',
  templateUrl: './issue-responded.component.html',
  styleUrls: ['./issue-responded.component.css']
})
export class IssueRespondedComponent implements OnInit {

  @ViewChild(IssueTablesComponent) table: IssueTablesComponent;

  readonly displayedColumns: string[] = ['id', 'title', 'type', 'severity', 'actions'];
  readonly actionButtons: ACTION_BUTTONS[] = [ACTION_BUTTONS.VIEW_IN_WEB, ACTION_BUTTONS.MARK_AS_PENDING];
  readonly filter: (issue: Issue) => boolean = (issue: Issue) => (issue.status === STATUS.Done);

  constructor() { }

  ngOnInit() {
  }

  applyFilter(filterValue: string) {
    this.table.issues.filter = filterValue;
  }

}
