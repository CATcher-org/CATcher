import { Component, OnInit } from '@angular/core';
import { PermissionService } from '../core/services/permission.service';
import { UserService } from '../core/services/user.service';

@Component({
  selector: 'app-phase-bug-trimming',
  templateUrl: './phase-bug-trimming.component.html',
  styleUrls: ['./phase-bug-trimming.component.css']
})
export class PhaseBugTrimmingComponent implements OnInit {
  constructor(public permissions: PermissionService, public userService: UserService) {}

  ngOnInit(): void {}
}
