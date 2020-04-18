import { GithubEventService } from '../../src/app/core/services/githubevent.service';
import { of } from 'rxjs';
import { EVENTS, ADD_LABEL_EVENT, CHANGE_TITLE_EVENT } from '../constants/githubevent.constants';

let githubService: any;
let issueService: any;

describe('GithubEventService', () => {
  beforeAll(() => {
    githubService = jasmine.createSpyObj('GithubService', ['fetchEventsForRepo']);
  });

  describe('.setLatestChangeEvent()', () => {
    it('stores the time of the most recent issue event\ and most recent issue update.', (done) => {
      githubService.fetchEventsForRepo.and.returnValue(of(EVENTS));
      const githubEventService: GithubEventService = new GithubEventService(githubService, null);
      githubEventService.setLatestChangeEvent().subscribe(_ => {
        assertLastModified(githubEventService, EVENTS);
        done();
      });
    });
  });

  describe('.reloadPage()', () => {
    beforeAll(() => {
      issueService = jasmine.createSpyObj('IssueService', ['reloadAllIssues']);
      issueService.reloadAllIssues.and.returnValue(of([]));
    });

    afterEach(() => {
      issueService.reloadAllIssues.calls.reset();
    });

    it('triggers the IssueService to re-initialise the issue list if there are new events', (done) => {
      const FIRST_EVENT = [ADD_LABEL_EVENT];
      const SECOND_EVENT = [CHANGE_TITLE_EVENT];
      githubService.fetchEventsForRepo.and.returnValue(of(FIRST_EVENT));
      const githubEventService: GithubEventService = new GithubEventService(githubService, issueService);

      githubEventService.reloadPage().subscribe(_ => {
        expect(issueService.reloadAllIssues.calls.count()).toBe(1);
        assertLastModified(githubEventService, FIRST_EVENT);

        githubService.fetchEventsForRepo.and.returnValue(of(SECOND_EVENT));
        githubEventService.reloadPage().subscribe(_ => {
          expect(issueService.reloadAllIssues.calls.count()).toBe(2);
          assertLastModified(githubEventService, SECOND_EVENT);
          done();
        });
      });
    });

    it('does not trigger the IssueService to re-initialise the issue list, if there are no new events',
      (done) => {

      githubService.fetchEventsForRepo.and.returnValue(of(EVENTS));
      const githubEventService: GithubEventService = new GithubEventService(githubService, issueService);

      githubEventService.reloadPage().subscribe(_ => {
        expect(issueService.reloadAllIssues.calls.count()).toBe(1);
        assertLastModified(githubEventService, EVENTS);
        githubEventService.reloadPage().subscribe(_ => {
          // issueService.reloadAllIssues must not have been called again
          expect(issueService.reloadAllIssues.calls.count()).toBe(1);
          assertLastModified(githubEventService, EVENTS);
          done();
        });
      });
    });

  });

  describe('.reset()', () => {
    it('clears the details of the most recent event', (done) => {
      githubService.fetchEventsForRepo.and.returnValue(of(EVENTS));
      const githubEventService: GithubEventService = new GithubEventService(githubService, null);
      githubEventService.setLatestChangeEvent().subscribe(_ => {
        expect(githubEventService.getLastModifiedTime()).toBeDefined();
        expect(githubEventService.getLastModifiedCommentTime()).toBeDefined();
        githubEventService.reset();
        expect(githubEventService.getLastModifiedTime()).toBeUndefined();
        expect(githubEventService.getLastModifiedCommentTime()).toBeUndefined();
        done();
      });
    });
  });

});

function assertLastModified(githubEventService: GithubEventService, expectedEvents) {
  expect(githubEventService.getLastModifiedTime()).toBe(expectedEvents[0].created_at);
  expect(githubEventService.getLastModifiedCommentTime()).toBe(expectedEvents[0].issue.updated_at);
}
