import { Component, Input, OnInit } from '@angular/core';
import { Issue } from '../../../core/models/issue.model';

@Component({
  selector: 'app-team-response-parse-error',
  templateUrl: './team-response-parse-error.component.html',
  styleUrls: ['./team-response-parse-error.component.css']
})
export class TeamResponseParseErrorComponent implements OnInit {

  @Input() issue: Issue;

  constructor() { }

  ngOnInit() {
  }

}
