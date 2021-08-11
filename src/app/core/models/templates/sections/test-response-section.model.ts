import { TesterResponse } from '../../tester-response.model';
import { Section, SectionalDependency } from './section.model';
import { extractStringBetween } from '../../../../shared/lib/string-utils';

export class TesterResponseSection extends Section {
  testerResponses: TesterResponse[] = [];
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
      const regex: RegExp = new RegExp('#{2} *:question: *([\\w ]+)[\\r\\n]*(Team Chose.*[\\r\\n]* *Originally.*'
        + '|Team Chose.*[\\r\\n]*)[\\r\\n]*(- \\[x? ?\\] I disagree)[\\r\\n]*\\*\\*Reason *for *disagreement:\\*\\* *([\\s\\S]*?)'
        + '[\\n\\r]-{19}',
        'gi');
      while (matches = regex.exec(this.content)) {
        if (matches) {
          const [regexString, title, description, disagreeCheckbox, reasonForDisagreement] = matches;

          if (this.isSeverityDispute(title)) {
            this.teamChosenSeverity = this.parseTeamChosenSeverity(description);
          } else if (this.isTypeDispute(title)) {
            this.teamChosenType = this.parseTeamChosenType(description);
          }

          this.testerResponses.push(new TesterResponse(title, description, disagreeCheckbox, reasonForDisagreement.trim()));
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

  parseTeamChosenSeverity(description: string): string {
    return extractStringBetween(description, this.TEAM_RESPONSE_DESCRIPTION_SEVERITY_VALUE_PREFIX,
      this.TEAM_RESPONSE_DESCRIPTION_VALUE_SUFFIX);
  }

  parseTeamChosenType(description: string): string {
    return extractStringBetween(description, this.TEAM_RESPONSE_DESCRIPTION_TYPE_VALUE_PREFIX,
      this.TEAM_RESPONSE_DESCRIPTION_VALUE_SUFFIX);
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
