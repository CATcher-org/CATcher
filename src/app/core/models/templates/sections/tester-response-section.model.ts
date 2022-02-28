import { extractStringBetween } from '../../../../shared/lib/string-utils';
import { TesterResponse } from '../../tester-response.model';
import { Section, SectionalDependency } from './section.model';

// match format e.g. ## :question: Issue Title
const matchTitle = '#{2} *:question: *([\\w ]+)';
// match format e.g. Team Chose severity.Low \r\n Originally (or Team Chose) severity.High \r\n
const matchDescription = '(Team Chose.*[\\r\\n]* *Originally.*|Team Chose.*[\\r\\n]*)';
// match format e.g. - [x] (or - [ ]) **Reason for disagreement:** disagreement explanation
const matchDisagreement = '(- \\[x? ?\\] I disagree)[\\r\\n]*\\*\\*Reason *for *disagreement:\\*\\* *([\\s\\S]*?)';
const matchLinebreak = '[\\n\\r]-{19}';

export class TesterResponseSection extends Section {
  testerResponses: TesterResponse[] = [];
  testerDisagree: boolean;
  teamChosenSeverity?: string;
  teamChosenType?: string;

  ISSUE_SEVERITY_DISPUTE = 'Issue severity';
  ISSUE_TYPE_DISPUTE = 'Issue type';
  TEAM_RESPONSE_DESCRIPTION_TYPE_VALUE_PREFIX = '[`type.';
  TEAM_RESPONSE_DESCRIPTION_SEVERITY_VALUE_PREFIX = '[`severity.';
  TEAM_RESPONSE_DESCRIPTION_VALUE_SUFFIX = '`]';

  constructor(sectionalDependency: SectionalDependency, unprocessedContent: string) {
    super(sectionalDependency, unprocessedContent);
    if (!this.parseError) {
      let matches;
      const regex: RegExp = new RegExp([matchTitle, matchDescription, matchDisagreement].join('[\\r\\n]*') + matchLinebreak, 'gi');
      while ((matches = regex.exec(this.content))) {
        if (matches) {
          const [_, title, description, disagreeCheckbox, reasonForDisagreement] = matches;

          if (this.isSeverityDispute(title)) {
            this.teamChosenSeverity = this.parseTeamChosenSeverity(description);
          } else if (this.isTypeDispute(title)) {
            this.teamChosenType = this.parseTeamChosenType(description);
          }

          const disagreeCheckboxValue = this.parseCheckboxValue(disagreeCheckbox);
          if (disagreeCheckboxValue) {
            this.testerDisagree = true; // on any disagree, overall disagree with team response
          }

          this.testerResponses.push(
            new TesterResponse(
              title,
              description,
              this.parseCheckboxDescription(disagreeCheckbox),
              disagreeCheckboxValue,
              reasonForDisagreement.trim()
            )
          );
        }
      }
    }
  }

  isSeverityDispute(title: string): boolean {
    return title.trim() === this.ISSUE_SEVERITY_DISPUTE;
  }

  isTypeDispute(title: string): boolean {
    return title.trim() === this.ISSUE_TYPE_DISPUTE;
  }

  getTeamChosenType(): string {
    return this.teamChosenType;
  }

  getTeamChosenSeverity(): string {
    return this.teamChosenSeverity;
  }

  getTesterDisagree(): boolean {
    return this.testerDisagree;
  }

  parseTeamChosenSeverity(description: string): string {
    return extractStringBetween(
      description,
      this.TEAM_RESPONSE_DESCRIPTION_SEVERITY_VALUE_PREFIX,
      this.TEAM_RESPONSE_DESCRIPTION_VALUE_SUFFIX
    );
  }

  parseTeamChosenType(description: string): string {
    return extractStringBetween(description, this.TEAM_RESPONSE_DESCRIPTION_TYPE_VALUE_PREFIX, this.TEAM_RESPONSE_DESCRIPTION_VALUE_SUFFIX);
  }

  parseCheckboxValue(checkboxString: string): boolean {
    return checkboxString.charAt(3) === 'x'; // checkboxString in the format of - [x] or - [ ]
  }

  parseCheckboxDescription(checkboxString: string): string {
    return checkboxString.substring(6).trim(); // checkboxString has a fixed 5 characters at the start before the description
  }

  toString(): string {
    let toString = '';
    toString += `${this.header.toString()}\n`;
    for (const response of this.testerResponses) {
      toString += `${response.toString()}\n`;
    }
    return toString;
  }
}
