import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { LabelDefinitionPopupComponent } from '../../shared/label-definition-popup/label-definition-popup.component';
import { UserConfirmationComponent } from '../guards/user-confirmation/user-confirmation.component';
import { Issue } from '../models/issue.model';

@Injectable({
  providedIn: 'root'
})
export class DialogService {
  constructor(private dialog: MatDialog) {}

  openUserConfirmationModal(messages: string[], yesButtonMessage: string, noButtonMessage: string) {
    return this.dialog.open(UserConfirmationComponent, {
      data: {
        messages: messages,
        yesMessage: yesButtonMessage,
        noMessage: noButtonMessage
      }
    });
  }

  openLabelDefinitionDialog(labelName: String, labelDefinition: String) {
    return this.dialog.open(LabelDefinitionPopupComponent, {
      data: {
        header: labelName,
        body: labelDefinition
      }
    });
  }

  checkIfModified(
    form: FormGroup,
    initialField: string,
    formField: string,
    issue: Issue,
    openCancelDialog: () => void,
    cancelEditMode: () => void
  ) {
    const issueTitleInitialValue = issue[initialField] || '';
    const isModified = form.get(formField).value !== issueTitleInitialValue;
    if (isModified) {
      // if the field has been edited, request user to confirm the cancellation
      openCancelDialog();
    } else {
      // if no changes have been made, simply cancel edit mode without getting confirmation
      cancelEditMode();
    }
  }
}
