import { Component, OnInit } from '@angular/core';
import { PermissionService } from '../core/services/permission.service';
import { UserService } from '../core/services/user.service';

@Component({
  selector: 'app-phase-bug-reporting',
  templateUrl: './phase-bug-reporting.component.html',
  styleUrls: ['./phase-bug-reporting.component.css']
})
export class PhaseBugReportingComponent implements OnInit {
  constructor(public permissions: PermissionService, public userService: UserService) {}

  ngOnInit() {}
}
