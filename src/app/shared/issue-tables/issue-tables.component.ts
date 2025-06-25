import { AfterViewInit, Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort, Sort } from '@angular/material/sort';
import { finalize, take } from 'rxjs/operators';
import { Issue, STATUS } from '../../core/models/issue.model';
import { TableSettings } from '../../core/models/table-settings.model';
import { ErrorHandlingService } from '../../core/services/error-handling.service';
import { GithubService } from '../../core/services/github.service';
import { IssueTableSettingsService } from '../../core/services/issue-table-settings.service';
import { IssueService } from '../../core/services/issue.service';
import { LabelService } from '../../core/services/label.service';
import { LoggingService } from '../../core/services/logging.service';
import { PermissionService } from '../../core/services/permission.service';
import { PhaseService } from '../../core/services/phase.service';
import { UserService } from '../../core/services/user.service';
import { UndoActionComponent } from '../../shared/action-toasters/undo-action/undo-action.component';
import { IssuesDataTable } from './IssuesDataTable';

export enum ACTION_BUTTONS {
  VIEW_IN_WEB,
  MARK_AS_RESPONDED,
  MARK_AS_PENDING,
  RESPOND_TO_ISSUE,
  FIX_ISSUE,
  DELETE_ISSUE,
  RESTORE_ISSUE
}

@Component({
  selector: 'app-issue-tables',
  templateUrl: './issue-tables.component.html',
  styleUrls: ['./issue-tables.component.css']
})
export class IssueTablesComponent implements OnInit, AfterViewInit {
  snackBarAutoCloseTime = 3000;

  @Input() headers: string[];
  @Input() actions: ACTION_BUTTONS[];
  @Input() filters?: any = undefined;
  @Input() table_name: string;

  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  issues: IssuesDataTable;
  issuesPendingDeletion: { [id: number]: boolean };
  issuesPendingRestore: { [id: number]: boolean };

  selectedIssues: Issue[] = [];

  public tableSettings: TableSettings;

  public readonly action_buttons = ACTION_BUTTONS;

  constructor(
    public userService: UserService,
    public permissions: PermissionService,
    public labelService: LabelService,
    private githubService: GithubService,
    public issueService: IssueService,
    public issueTableSettingsService: IssueTableSettingsService,
    private phaseService: PhaseService,
    private errorHandlingService: ErrorHandlingService,
    private logger: LoggingService,
    private snackBar: MatSnackBar = null
  ) {}

  ngOnInit() {
    this.issues = new IssuesDataTable(this.issueService, this.sort, this.paginator, this.headers, this.filters);
    this.issuesPendingDeletion = {};
    this.issuesPendingRestore = {};
    this.tableSettings = this.issueTableSettingsService.getTableSettings(this.table_name);
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.issues.loadIssues();
    });
  }

  globalTableIndex(localTableIndex: number) {
    return this.issues.getGlobalTableIndex(localTableIndex);
  }

  sortChange(newSort: Sort) {
    this.tableSettings.sortActiveId = newSort.active;
    this.tableSettings.sortDirection = newSort.direction;
    this.issueTableSettingsService.setTableSettings(this.table_name, this.tableSettings);
  }

  pageChange(pageEvent: PageEvent) {
    this.tableSettings.pageSize = pageEvent.pageSize;
    this.tableSettings.pageIndex = pageEvent.pageIndex;
    this.issueTableSettingsService.setTableSettings(this.table_name, this.tableSettings);
  }

  isActionVisible(action: ACTION_BUTTONS): boolean {
    return this.actions.includes(action);
  }

  markAsResponded(issue: Issue, event: Event) {
    this.logger.info(`IssueTablesComponent: Marking Issue ${issue.id} as Responded`);
    const newIssue = issue.clone(this.phaseService.currentPhase);
    newIssue.status = STATUS.Done;
    this.issueService.updateIssue(newIssue).subscribe(
      (updatedIssue) => {
        this.issueService.updateLocalStore(updatedIssue);
      },
      (error) => {
        this.errorHandlingService.handleError(error);
      }
    );
    event.stopPropagation();
  }

  isResponseEditable() {
    return this.permissions.isTeamResponseEditable() || this.permissions.isTesterResponseEditable();
  }

  markAsPending(issue: Issue, event: Event) {
    this.logger.info(`IssueTablesComponent: Marking Issue ${issue.id} as Pending`);
    const newIssue = issue.clone(this.phaseService.currentPhase);
    newIssue.status = STATUS.Incomplete;
    this.issueService.updateIssue(newIssue).subscribe(
      (updatedIssue) => {
        this.issueService.updateLocalStore(updatedIssue);
      },
      (error) => {
        this.errorHandlingService.handleError(error);
      }
    );
    event.stopPropagation();
  }

  logIssueRespondRouting(id: number) {
    this.logger.info(`IssueTablesComponent: Proceeding to Respond to Issue ${id}`);
  }

  logIssueEditRouting(id: number) {
    this.logger.info(`IssueTablesComponent: Proceeding to Edit Issue ${id}`);
  }

  /**
   * Gets the number of resolved disputes.
   */
  todoFinished(issue: Issue): number {
    return issue.issueDisputes.length - issue.numOfUnresolvedDisputes();
  }

  /**
   * Checks if all the disputes are resolved.
   */
  isTodoListChecked(issue: Issue): boolean {
    return issue.issueDisputes && issue.numOfUnresolvedDisputes() === 0;
  }

  viewIssueInBrowser(id: number, event: Event) {
    this.logger.info(`IssueTablesComponent: Opening Issue ${id} on Github`);
    this.githubService.viewIssueInBrowser(id, event);
  }

  private handleIssueDeletionSuccess(id: number, event: Event, actionUndoable: boolean) {
    if (!actionUndoable) {
      return;
    }
    let snackBarRef = null;
    snackBarRef = this.snackBar.openFromComponent(UndoActionComponent, {
      data: { message: `Deleted issue ${id}` },
      duration: this.snackBarAutoCloseTime
    });
    snackBarRef.onAction().subscribe(() => {
      this.undeleteIssue(id, event, false);
    });
  }

  deleteIssue(id: number, event: Event, actionUndoable: boolean = true) {
    this.logger.info(`IssueTablesComponent: Deleting Issue ${id}`);

    this.issuesPendingDeletion = { ...this.issuesPendingDeletion, [id]: true };
    this.issueService
      .deleteIssue(id)
      .pipe(
        finalize(() => {
          const { [id]: issueRemoved, ...theRest } = this.issuesPendingDeletion;
          this.issuesPendingDeletion = theRest;
        })
      )
      .subscribe(
        (removedIssue) => this.handleIssueDeletionSuccess(id, event, actionUndoable),
        (error) => this.errorHandlingService.handleError(error)
      );

    // Deselect deleted issue
    const index = this.selectedIssues.findIndex((issue) => issue.id === id);
    if (index > -1) {
      this.selectedIssues.splice(index, 1);
    }

    event.stopPropagation();
  }

  private handleIssueRestorationSuccess(id: number, event: Event, actionUndoable: boolean) {
    if (!actionUndoable) {
      return;
    }
    let snackBarRef = null;
    snackBarRef = this.snackBar.openFromComponent(UndoActionComponent, {
      data: { message: `Restored issue ${id}` },
      duration: this.snackBarAutoCloseTime
    });
    snackBarRef.onAction().subscribe(() => {
      this.deleteIssue(id, event, false);
    });
  }

  undeleteIssue(id: number, event: Event, actionUndoable: boolean = true) {
    this.logger.info(`IssueTablesComponent: Undeleting Issue ${id}`);

    this.issuesPendingRestore = { ...this.issuesPendingRestore, [id]: true };
    this.issueService
      .undeleteIssue(id)
      .pipe(
        finalize(() => {
          const { [id]: issueRestored, ...theRest } = this.issuesPendingRestore;
          this.issuesPendingRestore = theRest;
        })
      )
      .subscribe(
        (restoredIssue) => this.handleIssueRestorationSuccess(id, event, actionUndoable),
        (error) => this.errorHandlingService.handleError(error)
      );
    event.stopPropagation();
  }

  private isIssueSelected(issue: Issue): boolean {
    return this.selectedIssues.some((i) => i.id === issue.id);
  }

  toggleAllIssueSelection() {
    if (this.selectedIssues.length > 0) {
      this.selectedIssues = [];
    } else {
      this.issues
        .connect()
        .pipe(take(1))
        .subscribe((issues: Issue[]) => {
          this.selectedIssues = [...issues];
        });
    }
  }

  toggleIssueSelection(issue: Issue) {
    const index = this.selectedIssues.indexOf(issue);
    if (index > -1) {
      this.selectedIssues.splice(index, 1);
    } else {
      this.selectedIssues.push(issue);
    }
  }

  deleteSelectedIssues(event: Event, actionUndoable: boolean = true) {
    this.logger.info(`IssueTablesComponent: Deleting selected issues`);

    // Add all issues into pending first
    const newPending: Record<number, boolean> = {};
    this.selectedIssues.forEach((issue) => {
      newPending[issue.id] = true;
    });
    this.issuesPendingDeletion = {
      ...this.issuesPendingDeletion,
      ...newPending
    };

    // Then delete all in parallel
    this.selectedIssues.map((issue) => {
      const id = issue.id;

      return this.issueService
        .deleteIssue(id)
        .pipe(
          finalize(() => {
            const { [id]: _, ...rest } = this.issuesPendingDeletion;
            this.issuesPendingDeletion = rest;
          })
        )
        .toPromise()
        .then(() => {
          this.handleIssueDeletionSuccess(id, event, actionUndoable);
          const index = this.selectedIssues.findIndex((issue) => issue.id === id);
          if (index > -1) {
            this.selectedIssues.splice(index, 1);
          }
        })
        .catch((error) => {
          this.errorHandlingService.handleError(error);
        });
    });

    event.stopPropagation();
  }
}
