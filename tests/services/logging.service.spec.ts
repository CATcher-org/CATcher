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

describe('LoggingService', () => {
  beforeEach(() => {
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

    spyOn(localStorage, 'getItem').and.callFake(mockLocalStorageFunctions.getItem);
    spyOn(localStorage, 'setItem').and.callFake(mockLocalStorageFunctions.setItem);
    spyOn(localStorage, 'removeItem').and.callFake(mockLocalStorageFunctions.removeItem);
    spyOn(localStorage, 'clear').and.callFake(mockLocalStorageFunctions.clear);
  });

  describe('.startSession()', () => {
    it('test local storage', () => {
      localStorage.setItem('test', 'value');
      expect(localStorage.getItem('test')).toEqual('value');
    });
  });
});
