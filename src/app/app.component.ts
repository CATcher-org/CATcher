import { Component } from '@angular/core';
import { ElectronService } from './services/electron.service';
import { AppConfig } from '../environments/environment';
import {fromEvent, merge, Observable} from 'rxjs';
import {map} from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  isNetworkOnline$ = this.createOnlineStatus$();

  constructor(public electronService: ElectronService) {

    console.log('AppConfig', AppConfig);

    if (electronService.isElectron()) {
      console.log('Mode electron');
      console.log('Electron ipcRenderer', electronService.ipcRenderer);
      console.log('NodeJS childProcess', electronService.childProcess);
    } else {
      console.log('Mode web');
    }
  }

  createOnlineStatus$() {
    return merge(
      fromEvent(window, 'offline').pipe(map(() => false)),
      fromEvent(window, 'online').pipe(map(() => true)),
      // start the observable stream with the initial online status
      Observable.create(sub => {
        sub.next(navigator.onLine);
        sub.complete();
      }));
  }
}
