import { Component, Input, OnInit } from '@angular/core';
import { Issue } from '../../core/models/issue.model';
import { PermissionService } from '../../core/services/permission.service';
import { LabelService } from '../../core/services/label.service';

@Component({
  selector: 'app-issue-tables',
  templateUrl: './issue-tables.component.html',
  styleUrls: ['./issue-tables.component.css']
})
export class IssueTablesComponent implements OnInit {

  @Input() issues: Issue[];
  @Input() headers: string[];

  constructor(private permissions: PermissionService,
              private labelService: LabelService) { }

  ngOnInit() {
  }

}
