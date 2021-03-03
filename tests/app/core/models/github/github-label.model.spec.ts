import { GithubLabel } from '../../../../../src/app/core/models/github/github-label.model';

describe('GithubLabel', () => {
  let githubLabel: GithubLabel;
  const category = 'severity';
  const value = 'LOW';

  it('.isCategorical() should return false when provided with no label name', () => {
    githubLabel = new GithubLabel({});
    expect(githubLabel.isCategorical()).toEqual(false);
  });

  it('.isCategorical() should return false when provided with a non-categorical label name', () => {
    githubLabel = new GithubLabel({ name: `${category}${value}` });
    expect(githubLabel.isCategorical()).toEqual(false);

    githubLabel = new GithubLabel({ name: `${category}             ${value}` });
    expect(githubLabel.isCategorical()).toEqual(false);

    githubLabel = new GithubLabel({ name: `${category}.......${value}` });
    expect(githubLabel.isCategorical()).toEqual(false);

    githubLabel = new GithubLabel({ name: `${category}.................${value}` });
    expect(githubLabel.isCategorical()).toEqual(false);
  });

  it('.isCategorical() should return true when provided with a categorical label name', () => {
    githubLabel = new GithubLabel({ name: `${category}.${value}` });
    expect(githubLabel.isCategorical()).toEqual(true);
  });

  it('.getCategory() and .getValue() should return the correct values given a categorical label name', () => {
    githubLabel = new GithubLabel({ name: `${category}.${value}` });
    expect(githubLabel.getCategory()).toEqual(category);
    expect(githubLabel.getValue()).toEqual(value);
  });

  it('.getCategory() and .getValue() should return the exact label name given a non-categorical label name', () => {
    githubLabel = new GithubLabel({ name: `${category}.......${value}` });
    expect(githubLabel.getCategory()).toEqual(githubLabel.name);
    expect(githubLabel.getValue()).toEqual(githubLabel.name);
  });
});
