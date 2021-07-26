import { LabelDefinitionPopupComponent } from "../../shared/label-definition-popup/label-definition-popup.component";
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material';

@Injectable({
    providedIn: 'root'
})

export class DialogService {

    constructor(private dialog: MatDialog) { }

    openLabelDefinitionDialog(labelName: String, labelDefinition: String) {
        return this.dialog.open(LabelDefinitionPopupComponent, {
            data: {
                header: labelName,
                body: labelDefinition
            }
        });
    }
}
