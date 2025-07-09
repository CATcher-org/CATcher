import { AfterViewInit, Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort, Sort } from '@angular/material/sort';
import { finalize } from 'rxjs/operators';
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
import { Observable } from 'rxjs';

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
  issuesPendingAction: { [id: number]: boolean };

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
    this.issuesPendingAction = {};
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

  deleteOrRestoreIssue(isDeleteAction: boolean, id: number, event: Event, actionUndoable: boolean = true) {
    const deletingKeyword = 'Deleting';
    const undeletingKeyword = 'Undeleting';
    this.logger.info(`IssueTablesComponent: ${isDeleteAction ? deletingKeyword : undeletingKeyword} Issue ${id}`);

    this.issuesPendingAction = { ...this.issuesPendingAction, [id]: true };

    let observableActionedIssue: Observable<Issue>;
    if (isDeleteAction) {
      observableActionedIssue = this.issueService.deleteIssue(id);
    } else {
      observableActionedIssue = this.issueService.undeleteIssue(id);
    }
    observableActionedIssue
      .pipe(
        finalize(() => {
          const { [id]: issueDeletedOrRestored, ...theRest } = this.issuesPendingAction;
          this.issuesPendingAction = theRest;
        })
      )
      .subscribe(
        () => this.handleIssueActionPerformedSuccess(isDeleteAction, id, event, actionUndoable),
        (error) => this.errorHandlingService.handleError(error)
      );
    event.stopPropagation();
  }

  private handleIssueActionPerformedSuccess(isDeleteAction: boolean, id: number, event: Event, actionUndoable: boolean) {
    const deletedKeyword = 'Deleted';
    const restoredKeyword = 'Restored';
    if (!actionUndoable) {
      return;
    }
    let snackBarRef = null;
    snackBarRef = this.snackBar.openFromComponent(UndoActionComponent, {
      data: { message: `${isDeleteAction ? deletedKeyword : restoredKeyword} issue ${id}` },
      duration: this.snackBarAutoCloseTime
    });
    snackBarRef.onAction().subscribe(() => {
      this.deleteOrRestoreIssue(!isDeleteAction, id, event, false);
    });
  }

  isActionPerformAllowed(isDeleteAction: boolean, id: number) {
    const actionButton = isDeleteAction ? this.action_buttons.DELETE_ISSUE : this.action_buttons.RESTORE_ISSUE;
    const isPermissionGranted = this.isIssueActionPermitted(isDeleteAction);
    return isPermissionGranted && !this.issuesPendingAction[id] && this.isActionVisible(actionButton);
  }

  private isIssueActionPermitted(isDeleteAction: boolean) {
    if (isDeleteAction) {
      return this.permissions.isIssueDeletable();
    }
    return this.permissions.isIssueRestorable();
  }

  shouldEnablePendingButton() {
    return (
      (this.userService.currentUser.role === 'Student' || this.userService.currentUser.role === 'Admin') &&
      this.isActionVisible(this.action_buttons.MARK_AS_PENDING)
    );
  }

  shouldEnablePendingActionSpinner(id: number) {
    return (
      this.issuesPendingAction[id] &&
      (this.isActionVisible(this.action_buttons.DELETE_ISSUE) || this.isActionVisible(this.action_buttons.RESTORE_ISSUE))
    );
  }

  shouldEnableRespondToIssue(issue: Issue) {
    return this.isResponseEditable() && !issue.status && this.isActionVisible(this.action_buttons.RESPOND_TO_ISSUE);
  }

  shouldEnableMarkAsResponded(issue: Issue) {
    return this.isResponseEditable() && issue.status && this.isActionVisible(this.action_buttons.MARK_AS_RESPONDED);
  }

  shouldEnableEditIssue() {
    return this.permissions.isIssueEditable() && this.isActionVisible(this.action_buttons.FIX_ISSUE);
  }
}
