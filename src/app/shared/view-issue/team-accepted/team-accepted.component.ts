import { Component, OnInit } from '@angular/core';
import { TeamAcceptedMessage } from '../../../core/models/templates/team-accepted-template.model';

@Component({
  selector: 'app-team-accepted',
  templateUrl: './team-accepted.component.html',
  styleUrls: ['./team-accepted.component.css']
})
export class TeamAcceptedComponent implements OnInit {
  message: string;
  constructor() {}

  ngOnInit() {
    this.message = TeamAcceptedMessage;
  }
}
