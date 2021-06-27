import { LoggingService } from '../../src/app/core/services/logging.service';

let loggingService: LoggingService;
let headerLog: string;
const mockDate = new Date(2021, 6, 27);
const infoLogMessage = 'Info log message';
const errorLogMessage = 'Error log message';
const warnLogMessage = 'Warn log message';
const debugLogMessage = 'Debug log Message';

const checkHeader = (lines: string[]) => {
  const startHeader = lines[0];
  const creationDate = new Date(lines[1]);
  expect(startHeader).toEqual(loggingService.LOG_START_HEADER);
  // Expect creation date to be close to current date
  expect(Date.now() - creationDate.getTime()).toBeLessThanOrEqual(2000);
};

const testAddLog = (message: string) => {
  loggingService.startSession();
  const initialLog = loggingService.getCachedLog();
  loggingService.info(message);
  const actualLog = loggingService.getCachedLog();
  const expectedLog = `${initialLog}\n${message}`;
  expect(actualLog).toEqual(expectedLog);
};

describe('LoggingService', () => {
  beforeEach(() => {
    // Initialize mock local storage
    let mockLocalStorage = {};
    const mockLocalStorageFunctions = {
      getItem: (key: string): string => {
        return key in mockLocalStorage ? mockLocalStorage[key] : null;
      },
      setItem: (key: string, value: string) => {
        mockLocalStorage[key] = value;
      },
      removeItem: (key: string) => {
        delete mockLocalStorage[key];
      },
      clear: () => {
        mockLocalStorage = {};
      }
    };

    // Mock function calls
    spyOn(localStorage, 'getItem').and.callFake(mockLocalStorageFunctions.getItem);
    spyOn(localStorage, 'setItem').and.callFake(mockLocalStorageFunctions.setItem);
    spyOn(localStorage, 'removeItem').and.callFake(mockLocalStorageFunctions.removeItem);
    spyOn(localStorage, 'clear').and.callFake(mockLocalStorageFunctions.clear);

    // Mock dates
    jasmine.clock().install();
    jasmine.clock().mockDate(mockDate);

    // Initialize logging service
    const electronService = jasmine.createSpyObj('ElectronService', ['isElectron']);
    electronService.isElectron = jasmine.createSpy('isElectron', () => false);
    loggingService = new LoggingService(electronService);
    headerLog = `${loggingService.LOG_START_HEADER}\n${mockDate.toLocaleString()}`;
    loggingService.reset();
    localStorage.clear();
  });

  afterEach(() => {
    loggingService.reset();
    localStorage.clear();
    jasmine.clock().uninstall();
  });

  describe('.startSession()', () => {
    it('should successfully initialize logging session', () => {
      loggingService.startSession();
      const actualLog = loggingService.getCachedLog();
      const expectedLog = headerLog;
      expect(actualLog).toEqual(expectedLog);
    });

    it('should successfully reinitialize logging session', () => {
      loggingService.startSession();
      loggingService.reset();
      loggingService.startSession();
      const actualLog = loggingService.getCachedLog();
      const expectedLog = `${headerLog}\n\n${headerLog}`;
      expect(actualLog).toEqual(expectedLog);
    });

    it('should successfully reinitialize logging session when limit reached', () => {
      for (let i = 0; i < loggingService.LOG_COUNT_LIMIT; i += 1) {
        loggingService.startSession();
        loggingService.reset();
      }
      loggingService.startSession();
      const actualLog = loggingService.getCachedLog();
      let expectedLog = '';
      for (let i = 0; i < loggingService.LOG_COUNT_LIMIT; i += 1) {
        if (i == loggingService.LOG_COUNT_LIMIT - 1) {
          expectedLog += headerLog;
        } else {
          expectedLog += `${headerLog}\n\n`;
        }
      }
      expect(actualLog).toEqual(expectedLog);
    });
  });

  describe('.reset()', () => {
    it('should do nothing if no session is ongoing', () => {
      loggingService.reset();
      const actualLog = loggingService.getCachedLog();
      expect(actualLog).toBeNull();
    });
  });

  describe('adding logs', () => {
    it('should successfully add info logs', () => {
      testAddLog(infoLogMessage);
    });

    it('should successfully add error logs', () => {
      testAddLog(errorLogMessage);
    });

    it('should successfully add info logs', () => {
      testAddLog(warnLogMessage);
    });

    it('should successfully add info logs', () => {
      testAddLog(debugLogMessage);
    });
  });
});
