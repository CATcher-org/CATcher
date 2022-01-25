import { GithubIssue } from '../github/github-issue.model';

export default function generateGithubIssuesArray(numberOfElements: number = 1): Array<GithubIssue> {
  const created_and_updated_date: string = getRandomDate().toISOString();
  return new Array<GithubIssue>(10).map((value: GithubIssue, index: number, array: GithubIssue[]) => {
    return new GithubIssue({
      id: index,
      number: Math.random(),
      assignees: undefined,
      body: `Automatically Generated Issue No id: ${index}.`,
      created_at: created_and_updated_date,
      labels: undefined,
      title: `Autogen Issue ${index}`,
      updated_at: created_and_updated_date,
      url: '',
      user: undefined,
      comments: undefined
    });
  });
}

/**
 * Returns a random Date between the start and end dates.
 * @param start - Date representing the start of the date range. Default: 1/1/2018
 * @param end - Date representing the end of the date range. Default: Current Date
 */
function getRandomDate(start: Date = new Date(2018, 1, 1), end: Date = new Date()): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}
