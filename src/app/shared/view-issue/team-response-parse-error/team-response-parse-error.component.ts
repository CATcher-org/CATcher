import { Component, Input, OnInit } from '@angular/core';
import { Issue } from '../../../core/models/issue.model';
import { IssueService } from '../../../core/services/issue.service';
import { PermissionService } from '../../../core/services/permission.service';
import { PhaseService } from '../../../core/services/phase.service';

@Component({
  selector: 'app-team-response-parse-error',
  templateUrl: './team-response-parse-error.component.html',
  styleUrls: ['./team-response-parse-error.component.css']
})
export class TeamResponseParseErrorComponent implements OnInit {

  @Input() issue: Issue;

  constructor(private issueService: IssueService,
              private permissions: PermissionService,
              private phaseService: PhaseService) { }

  ngOnInit() {
  }

}
