import { AfterViewInit, Component } from '@angular/core';
import { AppConfig } from '../environments/environment';
import { ErrorHandlingService } from './core/services/error-handling.service';
import { LoggingService } from './core/services/logging.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit {
  NOT_CONNECTED_ERROR: Error = new Error('You are not connected to the internet.');

  constructor(logger: LoggingService, public errorHandlingService: ErrorHandlingService) {
    logger.info('AppComponent: AppConfig', AppConfig);
    logger.info('AppComponent: Mode web');
  }

  ngAfterViewInit() {
    this.addListenerForNetworkOffline();
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
