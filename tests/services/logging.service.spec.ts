import { LoggingService } from '../../src/app/core/services/logging.service';

let loggingService: LoggingService;
// const getFilteredLogCount: (currentLog: string, predicate: (line: string) => boolean) => number = (
//   currentLog: string,
//   predicate: (line: string) => boolean
// ) =>
//   loggingService
//     .getTrimmedLogCache(currentLog, loggingService.LOG_COUNT_LIMIT)
//     .split('\n')
//     .filter((line: string) => predicate(line)).length;
const oldLogIdentifier = 'Old Log';
const repeatOldLogStartHeader: (numberOfRepitions: number) => string = (numberofRepitions: number) => {
  return `${loggingService.LOG_START_HEADER}\n${oldLogIdentifier}\n`.repeat(numberofRepitions);
};
const logHeaderFilter: (line: string) => boolean = (line: string) => line === loggingService.LOG_START_HEADER;
const oldLogFilter: (line: string) => boolean = (line: string) => line === oldLogIdentifier;

// describe('LoggingService', () => {
//   beforeAll(() => {
//     const electronService = jasmine.createSpyObj('ElectronService', ['isElectron']);
//     electronService.isElectron = jasmine.createSpy('isElectron', () => false);
//     loggingService = new LoggingService(electronService);
//   });

//   describe('.getTrimmedLogCache()', () => {
//     it('should return 1 new log if cache does not contain existing log', () => {
//       expect(getFilteredLogCount(undefined, logHeaderFilter)).toEqual(1);
//       expect(getFilteredLogCount('', logHeaderFilter)).toEqual(1);
//       expect(getFilteredLogCount('gibberish', logHeaderFilter)).toEqual(1);
//     });

//     it('should return additional logs if cache contains existing log', () => {
//       let logCounter = 1;

//       while (logCounter < loggingService.LOG_COUNT_LIMIT) {
//         expect(getFilteredLogCount(repeatOldLogStartHeader(logCounter), logHeaderFilter)).toEqual(logCounter + 1);
//         logCounter += 1;
//       }
//     });

//     it('should return updated log if log in cache contains max number of sessions', () => {
//       // Number of logs must stay the same
//       expect(getFilteredLogCount(repeatOldLogStartHeader(loggingService.LOG_COUNT_LIMIT), logHeaderFilter)).toEqual(
//         loggingService.LOG_COUNT_LIMIT
//       );

//       // Number of Old Logs must be reduced by 1 (To make way for the new session log)
//       expect(getFilteredLogCount(repeatOldLogStartHeader(loggingService.LOG_COUNT_LIMIT), oldLogFilter)).toEqual(
//         loggingService.LOG_COUNT_LIMIT - 1
//       );
//     });

//     it('should return trimmed and updated log if log in cache exceeds max number of sessions', () => {
//       const exceededSessionCount = loggingService.LOG_COUNT_LIMIT + 10; // Arbitrary Exceed Count

//       // Number of logs must be at max number
//       expect(getFilteredLogCount(repeatOldLogStartHeader(exceededSessionCount), logHeaderFilter)).toEqual(loggingService.LOG_COUNT_LIMIT);

//       // Number of Old Logs must be Max - 1 (To make way for the new session log)
//       expect(getFilteredLogCount(repeatOldLogStartHeader(exceededSessionCount), oldLogFilter)).toEqual(loggingService.LOG_COUNT_LIMIT - 1);
//     });
//   });
// });

const checkHeader = (lines: string[]) => {
  const startHeader = lines[0];
  const creationDate = new Date(lines[1]);
  expect(startHeader).toEqual(loggingService.LOG_START_HEADER);
  // Expect creation date to be close to current date
  expect(Date.now() - creationDate.getTime()).toBeLessThanOrEqual(2000);
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

    // Initialize logging service
    const electronService = jasmine.createSpyObj('ElectronService', ['isElectron']);
    electronService.isElectron = jasmine.createSpy('isElectron', () => false);
    loggingService = new LoggingService(electronService);
    loggingService.reset();
    localStorage.clear();
  });

  afterEach(() => {
    console.log('Reset all');
    loggingService.reset();
    localStorage.clear();
  });

  describe('.startSession()', () => {
    it('should successfully initialize logging session', () => {
      loggingService.startSession();
      const cachedLog = loggingService.getCachedLog();
      const lines = cachedLog.split('\n');
      expect(lines.length).toEqual(2);
      checkHeader(lines);
    });

    it('should successfully reinitialize logging session', () => {
      loggingService.startSession();
      loggingService.reset();
      loggingService.startSession();
      const cachedLog = loggingService.getCachedLog();
      const sessions = cachedLog.split('\n\n');
      expect(sessions.length).toEqual(2);
      const firstSessionLines = sessions[0].split('\n');
      const secondSessionLines = sessions[1].split('\n');
      checkHeader(firstSessionLines);
      checkHeader(secondSessionLines);
    });

    it('should successfully reinitialize logging session when limit reached', () => {
      for (let i = 0; i < loggingService.LOG_COUNT_LIMIT; i += 1) {
        loggingService.startSession();
        loggingService.reset();
      }
      loggingService.startSession();
      const cachedLog = loggingService.getCachedLog();
      const sessions = cachedLog.split('\n\n');
      expect(sessions.length).toEqual(loggingService.LOG_COUNT_LIMIT);
      for (const session of sessions) {
        checkHeader(session.split('\n'));
      }
    });
  });
});
