import { AfterViewInit, Component } from '@angular/core';
import { AppConfig } from '../environments/environment';
import { ElectronService } from './core/services/electron.service';
import { ErrorHandlingService } from './core/services/error-handling.service';
import { LoggingService } from './core/services/logging.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit {
  NOT_CONNECTED_ERROR: Error = new Error('You are not connected to the internet.');

  constructor(public electronService: ElectronService, logger: LoggingService, public errorHandlingService: ErrorHandlingService) {
    logger.info('AppComponent: AppConfig', AppConfig);

    if (electronService.isElectron()) {
      logger.info('AppComponent: Mode electron');
    } else {
      logger.info('AppComponent: Mode web');
    }
  }

  ngAfterViewInit() {
    this.addListenerForHttpLinks();
    this.addListenerForNetworkOffline();
  }

  /**
   * This listener will prevent the default behaviour of electron to open http links on electron browser itself.
   * Will use the client's default OS browser to open the link.
   */
  addListenerForHttpLinks() {
    document.addEventListener(
      'click',
      (event) => {
        const elem = <HTMLLinkElement>(<HTMLElement>event.target).closest('a[href^="http"]');
        if (elem) {
          event.preventDefault();
          event.stopPropagation();
          this.electronService.openLink(elem.href);
        }
      },
      false
    );
  }

  /**
   * This listener checks if CATcher has a connection to a network, and will show an error snackbar if it does not.
   */
  addListenerForNetworkOffline() {
    window.addEventListener(
      'offline',
      (event) => {
        this.errorHandlingService.handleError(this.NOT_CONNECTED_ERROR);
      },
      false
    );
  }
}
