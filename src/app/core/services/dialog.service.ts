import { ModalPopupComponent } from "../../shared/modal-popup/modal-popup.component";
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material';

@Injectable({
    providedIn: 'root'
})

export class DialogService {

    constructor(private dialog: MatDialog) { }

    openDefinitionDialog(header: String, msg: String) {
        return this.dialog.open(ModalPopupComponent, {
            data: {
                header: header,
                message: msg,
            }
        });
    }
}
