import { LoggingService } from '../../src/app/core/services/logging.service';
import { MockLocalStorage } from '../helper/mock.local.storage';

let logger: LoggingService;
let headerLog: string;
let sessionSeparator: string;
const mockDate = new Date(2021, 6, 27);
const infoLogMessage = 'Info log message';

const mockLocalStorageFunctionCalls = (mockLocalStorage: MockLocalStorage) => {
  spyOn(localStorage, 'getItem').and.callFake(mockLocalStorage.getItem.bind(mockLocalStorage));
  spyOn(localStorage, 'setItem').and.callFake(mockLocalStorage.setItem.bind(mockLocalStorage));
  spyOn(localStorage, 'removeItem').and.callFake(mockLocalStorage.removeItem.bind(mockLocalStorage));
  spyOn(localStorage, 'clear').and.callFake(mockLocalStorage.clear.bind(mockLocalStorage));
};

const mockDates = () => {
  jasmine.clock().install();
  jasmine.clock().mockDate(mockDate);
};

const initializeLoggingService = () => {
  const electronService = jasmine.createSpyObj('ElectronService', ['isElectron']);
  electronService.isElectron = jasmine.createSpy('isElectron', () => false);
  logger = new LoggingService(electronService);
  headerLog = `${logger.LOG_START_HEADER}\n${mockDate.toLocaleString()}`;
  sessionSeparator = logger.SESSION_LOG_SEPARATOR;
};

describe('LoggingService', () => {
  beforeAll(() => {
    const mockLocalStorage = new MockLocalStorage();
    mockLocalStorageFunctionCalls(mockLocalStorage);
    mockDates();
    initializeLoggingService();
  });

  beforeEach(() => {
    logger.reset();
    localStorage.clear();
  });

  afterAll(() => {
    jasmine.clock().uninstall();
  });

  describe('.startSession()', () => {
    it('should successfully initialize logging session', () => {
      logger.startSession();
      const actualLog = logger.getCachedLog();
      const expectedLog = headerLog;
      expect(actualLog).toEqual(expectedLog);
    });

    it('should successfully reinitialize logging session', () => {
      logger.startSession();
      logger.reset();
      logger.startSession();
      const actualLog = logger.getCachedLog();
      const expectedLog = `${headerLog}${sessionSeparator}${headerLog}`;
      expect(actualLog).toEqual(expectedLog);
    });

    it('should successfully reinitialize logging session when limit reached', () => {
      Array(logger.LOG_COUNT_LIMIT)
        .fill(0)
        .forEach(() => {
          logger.startSession();
          logger.reset();
        });
      logger.startSession();
      const actualLog = logger.getCachedLog();
      const expectedLog = Array(logger.LOG_COUNT_LIMIT)
        .fill('')
        .map((_) => headerLog)
        .join(sessionSeparator);
      expect(actualLog).toEqual(expectedLog);
    });
  });

  describe('.reset()', () => {
    it('should do nothing if no session is ongoing', () => {
      logger.reset();
      const actualLog = logger.getCachedLog();
      expect(actualLog).toBeNull();
    });

    it('should not tamper with existing log histories', () => {
      let expectedLog = headerLog;
      for (let i = 0; i < logger.LOG_COUNT_LIMIT + 1; i += 1) {
        logger.startSession();
        logger.reset();
        const actualLog = logger.getCachedLog();
        expect(actualLog).toEqual(expectedLog);
        if (i < logger.LOG_COUNT_LIMIT - 1) {
          expectedLog += `${sessionSeparator}${headerLog}`;
        }
      }
    });
  });

  describe('adding logs', () => {
    it('should successfully add info logs', () => {
      logger.startSession();
      const initialLog = logger.getCachedLog();
      logger.info(infoLogMessage);
      const actualLog = logger.getCachedLog();
      const expectedLog = `${initialLog}\n${infoLogMessage}`;
      expect(actualLog).toEqual(expectedLog);
    });
  });

  describe('updating and trimming logs from sessions', () => {
    it('should trim oldest log if number of sessions exceed session limit', () => {
      Array(logger.LOG_COUNT_LIMIT + 1)
        .fill(0)
        .forEach(() => {
          logger.startSession();
          logger.info(infoLogMessage);
          logger.reset();
        });
      logger.startSession();
      const actualLog = logger.getCachedLog();
      const expectedLog = Array(logger.LOG_COUNT_LIMIT)
        .fill('')
        .map((_) => headerLog)
        .join(`\n${infoLogMessage}${sessionSeparator}`);
      expect(actualLog).toEqual(expectedLog);
    });
  });
});
