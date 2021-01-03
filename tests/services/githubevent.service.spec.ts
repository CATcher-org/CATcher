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
    it('stores the time of the most recent issue event\ and most recent issue update.', async () => {
      githubService.fetchEventsForRepo.and.returnValue(of(EVENTS));
      const githubEventService: GithubEventService = new GithubEventService(githubService, null);
      await githubEventService.setLatestChangeEvent().toPromise();
      assertLastModified(githubEventService, EVENTS);
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

    it('triggers the IssueService to re-initialise the issue list if there are new events', async () => {
      const FIRST_EVENT = [ADD_LABEL_EVENT];
      const SECOND_EVENT = [CHANGE_TITLE_EVENT];
      githubService.fetchEventsForRepo.and.returnValue(of(FIRST_EVENT));
      const githubEventService: GithubEventService = new GithubEventService(githubService, issueService);

      await githubEventService.reloadPage().toPromise();
      expect(issueService.reloadAllIssues.calls.count()).toBe(1);
      assertLastModified(githubEventService, FIRST_EVENT);

      githubService.fetchEventsForRepo.and.returnValue(of(SECOND_EVENT));
      await githubEventService.reloadPage().toPromise();
      expect(issueService.reloadAllIssues.calls.count()).toBe(2);
      assertLastModified(githubEventService, SECOND_EVENT);
    });

    it('does not trigger the IssueService to re-initialise the issue list, if there are no new events',
      async () => {

      githubService.fetchEventsForRepo.and.returnValue(of(EVENTS));
      const githubEventService: GithubEventService = new GithubEventService(githubService, issueService);

      await githubEventService.reloadPage().toPromise();
      expect(issueService.reloadAllIssues.calls.count()).toBe(1);
      assertLastModified(githubEventService, EVENTS);
      await githubEventService.reloadPage().toPromise();
      // issueService.reloadAllIssues must not have been called again
      expect(issueService.reloadAllIssues.calls.count()).toBe(1);
      assertLastModified(githubEventService, EVENTS);
    });

  });

  describe('.reset()', () => {
    it('clears the details of the most recent event', async () => {
      githubService.fetchEventsForRepo.and.returnValue(of(EVENTS));
      const githubEventService: GithubEventService = new GithubEventService(githubService, null);
      const githubEventServiceSetLastModifiedTime = spyOn<any>(githubEventService, 'setLastModifiedTime');
      const githubEventServiceSetLastModifiedCommentTime = spyOn<any>(githubEventService, 'setLastModifiedCommentTime');

      await githubEventService.setLatestChangeEvent().toPromise();
      expect(githubEventServiceSetLastModifiedTime).toHaveBeenCalledTimes(1);
      expect(githubEventServiceSetLastModifiedCommentTime).toHaveBeenCalledTimes(1);
      githubEventService.reset();
      expect(githubEventServiceSetLastModifiedTime).toHaveBeenCalledWith(undefined);
      expect(githubEventServiceSetLastModifiedCommentTime).toHaveBeenCalledWith(undefined);
    });
  });

});

function assertLastModified(githubEventService: GithubEventService, expectedEvents) {
  // expect(githubEventService.getLastModifiedTime()).toBe(expectedEvents[0].created_at);
  // expect(githubEventService.getLastModifiedCommentTime()).toBe(expectedEvents[0].issue.updated_at);
}
