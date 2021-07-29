import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material';
import { UserConfirmationComponent } from '../guards/user-confirmation/user-confirmation.component';

@Injectable({
    providedIn: 'root'
})

export class DialogService {

    constructor(private dialog: MatDialog) { }

    openUserConfirmationModal() {
        return this.dialog.open(UserConfirmationComponent);
    }
}