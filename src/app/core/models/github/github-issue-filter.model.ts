import { IssueFilters, IssueState } from '../../../../../graphql/graphql-types';
import { RestGithubIssueState } from './github-rest-issue';

export type RestGithubSortBy = 'created' | 'updated' | 'comments';
export type RestGithubSortDir = 'asc' | 'desc';

export interface RestGithubIssueFilterData {
  state?: RestGithubIssueState;
  labels?: Array<string>;
  sort?: RestGithubSortBy;
  direction?: RestGithubSortDir;
  since?: string; // ISO 8601 format: YYYY-MM-DDTHH:MM:SSZ
  milestone?: number | '*' | 'none';
  assignee?: string;
  creator?: string;
  mentioned?: string;
}
/**
 * A filter to filter out the issues to retrieve from github.
 * Ref: https://docs.github.com/en/rest/issues/issues#list-repository-issues--parameters
 * */
export default class RestGithubIssueFilter implements RestGithubIssueFilterData {
  state?: RestGithubIssueState;
  labels?: Array<string>;
  sort?: RestGithubSortBy;
  direction?: RestGithubSortDir;
  since?: string;
  milestone?: number | '*' | 'none';
  assignee?: string;
  creator?: string;
  mentioned?: string;

  constructor(data: RestGithubIssueFilterData) {
    Object.assign(this, data);
  }

  convertToGraphqlFilter(): IssueFilters {
    return <IssueFilters>{
      assignee: this.assignee,
      createdBy: this.creator,
      labels: this.labels,
      mentioned: this.mentioned,
      milestone: this.milestone,
      since: this.since,
      states:
        this.state === 'all' ? [IssueState.Closed, IssueState.Open] : this.state === 'closed' ? [IssueState.Closed] : [IssueState.Open]
    };
  }
}
