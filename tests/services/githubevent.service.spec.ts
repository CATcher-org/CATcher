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
      githubEventService.reloadPage().subscribe(result => expect(result).toBe(false));
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
      githubEventService.reloadPage().subscribe(result => expect(result).toBe(true));
      expect(issueService.reloadAllIssues.calls.count()).toBe(1);

      githubService.fetchEventsForRepo.and.returnValue(of(SECOND_EVENT));
      githubEventService.reloadPage().subscribe(result => expect(result).toBe(true));
      expect(issueService.reloadAllIssues.calls.count()).toBe(2);
    });

    it('does not trigger the IssueService to re-initialise the issue list, if there are no new events',
      async () => {

      githubService.fetchEventsForRepo.and.returnValue(of(EVENTS));
      const githubEventService: GithubEventService = new GithubEventService(githubService, issueService);

      githubEventService.reloadPage().subscribe(result => expect(result).toBe(true));
      expect(issueService.reloadAllIssues.calls.count()).toBe(1);

      // issueService.reloadAllIssues must not have been called again
      githubEventService.reloadPage().subscribe(result => expect(result).toBe(false));
      expect(issueService.reloadAllIssues.calls.count()).toBe(1);
    });

  });

  describe('.reset()', () => {
    it('clears the details of the most recent event', async () => {
      githubService.fetchEventsForRepo.and.returnValue(of(EVENTS));
      const githubEventService: GithubEventService = new GithubEventService(githubService, null);
      await githubEventService.setLatestChangeEvent().toPromise();
      githubEventService.reset();

       // reloadPage should return an Observable of true due to reset()
      githubEventService.reloadPage().subscribe(result => expect(result).toBe(true));
    });
  });

});

