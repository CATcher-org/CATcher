import { ErrorHandlingService } from '../../src/app/core/services/error-handling.service';
import { FormErrorComponent } from '../../src/app/shared/error-toasters/form-error/form-error.component';
import { GeneralMessageErrorComponent } from '../../src/app/shared/error-toasters/general-message-error/general-message-error.component';
import {
  ERROR_WITH_NO_MESSAGE,
  HTTP_304_ERROR,
  HTTP_400_ERROR,
  HTTP_401_ERROR,
  HTTP_404_ERROR,
  HTTP_422_ERROR,
  HTTP_500_ERROR,
  OCTOKIT_REQUEST_ERROR,
  STANDARD_ERROR
} from '../constants/error.constants';

let errorHandlingService: ErrorHandlingService;
let mockLoggingService;
let mockSnackBar;

describe('ErrorHandlingService', () => {
  beforeEach(() => {
    mockLoggingService = jasmine.createSpyObj('LoggingService', ['error', 'debug']);
    mockSnackBar = jasmine.createSpyObj('MatSnackBar', ['openFromComponent']);
    errorHandlingService = new ErrorHandlingService(mockSnackBar, mockLoggingService);
  });

  describe('ErrorHandlingService: handleError()', () => {
    it('should log errors when handling errors', () => {
      errorHandlingService.handleError(STANDARD_ERROR);
      expect(mockLoggingService.error).toHaveBeenCalledWith(STANDARD_ERROR);
    });

    it('should use the GeneralMessageErrorComponent when handling Errors', () => {
      errorHandlingService.handleError(STANDARD_ERROR);
      expect(mockSnackBar.openFromComponent).toHaveBeenCalledWith(GeneralMessageErrorComponent, {
        data: { message: STANDARD_ERROR.message }
      });
    });

    it('should stringify Errors if there is no message before displaying', () => {
      errorHandlingService.handleError(ERROR_WITH_NO_MESSAGE);
      expect(mockSnackBar.openFromComponent).toHaveBeenCalledWith(GeneralMessageErrorComponent, {
        data: { message: JSON.stringify(ERROR_WITH_NO_MESSAGE) }
      });
    });

    it('should not open the snackbar when handling http status 304 errors', () => {
      errorHandlingService.handleError(HTTP_304_ERROR);
      expect(mockSnackBar.openFromComponent).not.toHaveBeenCalled();
    });

    it('should use the FormErrorComponent when handling http status 422 errors', () => {
      errorHandlingService.handleError(HTTP_422_ERROR);
      expect(mockSnackBar.openFromComponent).toHaveBeenCalledWith(FormErrorComponent, { data: HTTP_422_ERROR });
    });

    it('should use the GeneralMessageErrorComponent when handling other http errors', () => {
      errorHandlingService.handleError(HTTP_500_ERROR);
      expect(mockSnackBar.openFromComponent).toHaveBeenCalledWith(GeneralMessageErrorComponent, { data: HTTP_500_ERROR });
      errorHandlingService.handleError(HTTP_400_ERROR);
      expect(mockSnackBar.openFromComponent).toHaveBeenCalledWith(GeneralMessageErrorComponent, { data: HTTP_400_ERROR });
      errorHandlingService.handleError(HTTP_401_ERROR);
      expect(mockSnackBar.openFromComponent).toHaveBeenCalledWith(GeneralMessageErrorComponent, { data: HTTP_401_ERROR });
      errorHandlingService.handleError(HTTP_404_ERROR);
      expect(mockSnackBar.openFromComponent).toHaveBeenCalledWith(GeneralMessageErrorComponent, { data: HTTP_404_ERROR });
      expect(mockSnackBar.openFromComponent).toHaveBeenCalledTimes(4);
    });

    it('should treat octokit request errors as http errors', () => {
      errorHandlingService.handleError(OCTOKIT_REQUEST_ERROR);
      expect(mockSnackBar.openFromComponent).toHaveBeenCalledWith(GeneralMessageErrorComponent, { data: OCTOKIT_REQUEST_ERROR });
    });
  });
});
