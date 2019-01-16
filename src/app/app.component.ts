import { Component } from '@angular/core';
import { ElectronService } from './services/electron.service';
import { AppConfig } from '../environments/environment';
import {BehaviorSubject, fromEvent, merge, Observable, of} from 'rxjs';
import {map, mapTo} from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  isNetworkOnline$: Observable<boolean>;

  constructor(public electronService: ElectronService) {

    console.log('AppConfig', AppConfig);

    if (electronService.isElectron()) {
      console.log('Mode electron');
      console.log('Electron ipcRenderer', electronService.ipcRenderer);
      console.log('NodeJS childProcess', electronService.childProcess);
    } else {
      console.log('Mode web');
    }
    this.isNetworkOnline$ = merge(
      of(navigator.onLine),
      fromEvent(window, 'online').pipe(mapTo(true)),
      fromEvent(window, 'offline').pipe(mapTo(false))
    );
   }
}
