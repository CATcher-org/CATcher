import { NgModule } from '@angular/core';

import {SharedModule} from '../shared/shared.module';
import {Phase1RoutingModule} from './phase1-routing.module';
import {Phase1Component} from './phase1.component';
import {IssueModule} from './issue/issue.module';

@NgModule({
  imports: [
    Phase1RoutingModule,
    SharedModule,
    IssueModule,
  ],
  declarations: [
    Phase1Component,
  ],
})
export class Phase1Module {}
