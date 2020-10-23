import { GithubLabel } from '../../../../../src/app/core/models/github/github-label.model';

describe('GithubLabel', () => {
  let githubLabel: GithubLabel;
  const category = 'severity';
  const value = 'LOW';

  it('should returns false on isCategorical() when provided wit no name', () => {
    githubLabel = new GithubLabel({ });
    expect(githubLabel.isCategorical()).toEqual(false);
  });

  it('should returns false on isCategorical() when provided with invalid label name', () => {
    githubLabel = new GithubLabel({ name: `${category}${value}`  });
    expect(githubLabel.isCategorical()).toEqual(false);

    githubLabel = new GithubLabel({ name: `${category}             ${value}`  });
    expect(githubLabel.isCategorical()).toEqual(false);
  });

  it('should returns true on isCategorical() when provided with valid label name', () => {
    githubLabel = new GithubLabel({ name: `${category}.${value}` });
    expect(githubLabel.isCategorical()).toEqual(true);

    githubLabel = new GithubLabel({ name: `${category}.......${value}` });
    expect(githubLabel.isCategorical()).toEqual(false);

    githubLabel = new GithubLabel({ name: `${category}.................${value}` });
    expect(githubLabel.isCategorical()).toEqual(false);
  });

  it ('should return correct values on getCategory() and getValue()', () => {
    githubLabel = new GithubLabel({ name: `${category}.${value}` });
    expect(githubLabel.getCategory()).toEqual(category);
    expect(githubLabel.getValue()).toEqual(value);
  });
});
