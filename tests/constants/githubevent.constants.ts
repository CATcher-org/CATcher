import { ISSUE_WITH_ASSIGNEES, ISSUE_WITH_EMPTY_DESCRIPTION } from "./githubissue.constants";

/* Contains a simplified version of the data obtained when we query
   for the latest events on a repository using the Octokit API.
   (specifically, the data obtained from octokit.issues.listEventsForRepo())
   For repos used by CATcher, these events will only involve issues. */

export const CHANGE_TITLE_EVENT = {
    event: 'renamed',
    created_at: '2020-03-13T12:40:47Z',
    rename: {
        from: 'App lags on large amount of input',
        to: 'App starts to lag when given large amount of input'
    },
    issue: ISSUE_WITH_EMPTY_DESCRIPTION
};

export const ADD_LABEL_EVENT = {
    event: 'labeled',
    created_at: '2020-03-02T16:34:03Z',
    label: { name: 'severity.VeryLow', color: 'ffe0e0' },
    issue: ISSUE_WITH_ASSIGNEES
}

/* In the list of events returned by Octokit API,
   the events are ordered by time of creation,
   with the most recent events appearing first. */
export const EVENTS = [CHANGE_TITLE_EVENT, ADD_LABEL_EVENT];