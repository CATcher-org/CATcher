import { Injectable } from '@angular/core';
import { Observable, pipe, UnaryFunction } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import { GithubLabel } from '../models/github/github-label.model';
import { Label } from '../models/label.model';
import { GithubService } from './github.service';
import { LoggingService } from './logging.service';

/* The threshold to decide if color is dark or light.
A higher threshold value will result in more colors determined to be "dark".
W3C recommendation is 0.179, but 0.184 is chosen so that some colors (like bright red)
are considered dark (Github too consider them dark) */
const COLOR_DARKNESS_THRESHOLD = 0.184;

const COLOR_BLACK = '000000'; // Dark color for text with light background
const COLOR_WHITE = 'ffffff'; // Light color for text with dark background

const COLOR_RED_PALE = 'ffe0e0';
const COLOR_RED_LIGHT = 'ffcccc';
const COLOR_RED = 'ff9999';
const COLOR_RED_DARK = 'ff6666';

const COLOR_PURPLE_LIGHT = 'd966ff';
const COLOR_PURPLE = '9900cc';

const COLOR_GREEN = '00802b';
const COLOR_ORANGE_PALE = 'ffebcc';
const COLOR_ORANGE_LIGHT = 'ffcc80';
const COLOR_ORANGE = 'ff9900';

const COLOR_SILVER = 'a6a6a6';

const COLOR_BLUE = '0066ff';

const DISPLAY_NAME_SEVERITY = 'Severity';
const DISPLAY_NAME_BUG_TYPE = 'Bug Type';
const DISPLAY_NAME_RESPONSE = 'Response';

// The HTML template definition of selected labels are hard-coded here, move to a config file in the future
const VERY_LOW_DEFINITION =
  '<p>A flaw that is <mark>purely cosmetic</mark> and <mark>does not affect usage</mark>. For example, ' +
  '<ul>' +
  '<li>typo issues</li>' +
  '<li>spacing issues</li>' +
  '<li>layout issues</li>' +
  '<li>color issues</li>' +
  '<li>font issues</li>' +
  '</ul>' +
  "in the docs or the UI that doesn't affect usage.</p>";
const LOW_DEFINITION =
  '<p>A flaw that is unlikely to affect normal operations of the product. ' +
  'Appears only in very rare situations and causes a minor inconvenience only.</p>';
const MEDIUM_DEFINITION = '<p>A flaw that causes occasional inconvenience to some users but they can ' + 'continue to use the product.</p>';
const HIGH_DEFINITION =
  '<p>A flaw that affects most users and causes major problems for users.' + 'i.e., makes the product almost unusable for most users.</p>';

const FUNCTIONALITY_BUG_DEFINITION = '<p>A functionality does not work as specified/expected.</p>';
const FEATURE_FLAW_DEFINITION =
  '<p>Some functionality missing from a feature delivered in the current version in ' +
  'a way that the feature becomes less useful to the intended target user for <i>normal</i> usage. ' +
  "i.e., the feature is not 'complete'.\nIn other words, an acceptance-testing bug that falls within " +
  'the scope of the current version features. These issues are counted against the <i>product design</i> aspect ' +
  'of the project.</p>';
const DOCUMENTATION_BUG_DEFINITION =
  '<p>A flaw in the documentation ' + '<span style="color:grey;">e.g., a missing step, a wrong instruction, typos</span></p>';
const UI_FLAW_DEFINITION = 
  '<p>A flaw in the UI</p';
const ACCEPTED_DEFINITION = '<p>You accept it as a bug.</p>';
const NOT_IN_SCOPE_DEFINITION =
  '<p>It is a valid issue but not something the team should be penalized for ' +
  '<span style="color:grey;">e.g., it was not related to features delivered in this version</span>.</p>';
const REJECTED_DEFINITION =
  "<p>What tester treated as a bug is in fact the expected behavior (from the user's point of view), or the tester " +
  'was mistaken in some other way.</p>';
const CANNOT_REPRODUCE_DEFINITION = '<p>You are unable to reproduce the behavior reported in the bug after multiple tries.</p>';
const ISSUE_UNCLEAR_DEFINITION = '<p>The issue description is not clear.</p>';
const UNDEFINED_DEFINITION = null;

export const LABEL_DEFINITIONS = {
  severityVeryLow: VERY_LOW_DEFINITION,
  severityLow: LOW_DEFINITION,
  severityMedium: MEDIUM_DEFINITION,
  severityHigh: HIGH_DEFINITION,
  typeFunctionalityBug: FUNCTIONALITY_BUG_DEFINITION,
  typeFeatureFlaw: FEATURE_FLAW_DEFINITION,
  typeDocumentationBug: DOCUMENTATION_BUG_DEFINITION,
  typeUiFlaw: UI_FLAW_DEFINITION,
  responseAccepted: ACCEPTED_DEFINITION,
  responseNotInScope: NOT_IN_SCOPE_DEFINITION,
  responseRejected: REJECTED_DEFINITION,
  responseCannotProduce: CANNOT_REPRODUCE_DEFINITION,
  responseIssueUnclear: ISSUE_UNCLEAR_DEFINITION,
  undefined: UNDEFINED_DEFINITION
};

const REQUIRED_LABELS = {
  severity: {
    VeryLow: new Label('severity', 'VeryLow', COLOR_RED_PALE, VERY_LOW_DEFINITION),
    Low: new Label('severity', 'Low', COLOR_RED_LIGHT, LOW_DEFINITION),
    Medium: new Label('severity', 'Medium', COLOR_RED, MEDIUM_DEFINITION),
    High: new Label('severity', 'High', COLOR_RED_DARK, HIGH_DEFINITION)
  },
  type: {
    DocumentationBug: new Label('type', 'DocumentationBug', COLOR_PURPLE_LIGHT, DOCUMENTATION_BUG_DEFINITION),
    FeatureFlaw: new Label('type', 'FeatureFlaw', COLOR_PURPLE_LIGHT, FEATURE_FLAW_DEFINITION),
    FunctionalityBug: new Label('type', 'FunctionalityBug', COLOR_PURPLE, FUNCTIONALITY_BUG_DEFINITION),
    UiFlaw: new Label('type', 'UiFlaw', COLOR_PURPLE, FUNCTIONALITY_BUG_DEFINITION)
  },
  response: {
    Accepted: new Label('response', 'Accepted', COLOR_GREEN, ACCEPTED_DEFINITION),
    CannotReproduce: new Label('response', 'CannotReproduce', COLOR_ORANGE_PALE, CANNOT_REPRODUCE_DEFINITION),
    IssueUnclear: new Label('response', 'IssueUnclear', COLOR_ORANGE_LIGHT, ISSUE_UNCLEAR_DEFINITION),
    NotInScope: new Label('response', 'NotInScope', COLOR_ORANGE_LIGHT, NOT_IN_SCOPE_DEFINITION),
    Rejected: new Label('response', 'Rejected', COLOR_ORANGE, REJECTED_DEFINITION)
  },
  status: {
    Done: new Label('status', 'Done', COLOR_SILVER),
    Incomplete: new Label('status', 'Incomplete', COLOR_BLACK)
  },
  others: {
    duplicate: new Label(undefined, 'duplicate', COLOR_BLUE)
  }
};

export type LabelCategory = keyof typeof REQUIRED_LABELS;

@Injectable({
  providedIn: 'root'
})

/**
 * Responsible for retrieval and parsing and syncing of label data
 * from the GitHub repository for the CATcher application.
 */
export class LabelService {
  private static severityLabels: Label[] = Object.values(REQUIRED_LABELS.severity);
  private static typeLabels: Label[] = Object.values(REQUIRED_LABELS.type);
  private static responseLabels: Label[] = Object.values(REQUIRED_LABELS.response);
  private static statusLabels: Label[] = Object.values(REQUIRED_LABELS.status);
  private static otherLabels: Label[] = Object.values(REQUIRED_LABELS.others);

  private static allLabelArrays = {
    severity: LabelService.severityLabels,
    type: LabelService.typeLabels,
    response: LabelService.responseLabels,
    status: LabelService.statusLabels,
    others: LabelService.otherLabels
  };
  private static testerLabelArrays = {
    severity: LabelService.severityLabels,
    type: LabelService.typeLabels
  };

  constructor(private githubService: GithubService, private logger: LoggingService) {}

  public static getRequiredLabelsAsArray(needAllLabels: boolean): Label[] {
    let requiredLabels: Label[] = [];

    const labels = needAllLabels ? Object.values(this.allLabelArrays) : Object.values(this.testerLabelArrays);
    labels.map((label) => (requiredLabels = requiredLabels.concat(label)));
    return requiredLabels;
  }

  /**
   * Updates the required label to be in sync with the labels on the GitHub repository.
   */
  public static updateRequiredLabelColor(labelColor: string, label: Label) {
    const labelArray = LabelService.allLabelArrays[label.labelCategory];

    if (labelArray) {
      const requiredLabel = labelArray.find((requiredLabel: Label) => requiredLabel.labelValue === label.labelValue);
      requiredLabel.labelColor = labelColor;
    }
  }

  /**
   * Returns an custom operator which helps to
   * synchronise the labels in our application
   * with the remote repository.
   */
  syncLabels(needAllLabels: boolean): UnaryFunction<Observable<boolean>, Observable<any>> {
    return pipe(mergeMap(() => this.synchronizeRemoteLabels(needAllLabels)));
  }

  /**
   * Synchronizes the labels in github with those required by the application.
   */
  synchronizeRemoteLabels(needAllLabels: boolean): Observable<any> {
    return this.githubService.fetchAllLabels().pipe(
      map((githubLabels) => githubLabels.map(this.toLabel)),
      map((response) => {
        this.ensureRepoHasRequiredLabels(response, LabelService.getRequiredLabelsAsArray(needAllLabels));
        return response;
      })
    );
  }

  /**
   * Returns all the labels of a certain type (e.g severity)
   * @param attributeName: the type of the label
   * @return an array of label of that type
   */
  getLabelList(attributeName: string): Label[] {
    switch (attributeName) {
      case 'severity':
        return LabelService.severityLabels;
      case 'type':
        return LabelService.typeLabels;
      // case 'responseTag':
      case 'response':
        return LabelService.responseLabels;
    }
    this.logger.info(`LabelService: Unfiltered Attribute ${attributeName} in getLabelList`);
  }

  /**
   * Returns a title for the label type
   * @param attributeName: the type of the label
   */
  getLabelTitle(attributeName: string): string {
    switch (attributeName) {
      case 'severity':
        return DISPLAY_NAME_SEVERITY;
      case 'type':
        return DISPLAY_NAME_BUG_TYPE;
      case 'response':
        return DISPLAY_NAME_RESPONSE;
    }
    this.logger.info(`LabelService: Unfiltered Attribute ${attributeName} in getLabelTitle`);
  }

  /**
   * Returns the color of the label by searching a list of
   * all available labels.
   * @param labelValue: the label's value (e.g Low / Medium / High / ...)
   */
  getColorOfLabel(labelCategory: LabelCategory, labelValue: string): string {
    if (labelValue === '' || !LabelService.allLabelArrays[labelCategory]) {
      this.logger.info(`LabelService: Unfiltered Attribute, ${labelValue}: ${labelCategory} in getColorOfLabel`);

      return COLOR_WHITE;
    }

    const existingLabel = LabelService.allLabelArrays[labelCategory].find((label: Label) => label.labelValue === labelValue);

    if (existingLabel === undefined || existingLabel.labelColor === undefined) {
      return COLOR_WHITE;
    } else {
      return existingLabel.labelColor;
    }
  }

  /**
   * Returns the definition of the label by searching a list of
   * all available labels.
   * @param labelValue: the label's value (e.g Low/ Medium/ High / ...).
   * @param labelCategory: the label's category (e.g Type/ Severity / ...).
   */
  getLabelDefinition(labelValue: string, labelCategory: string): string {
    if (labelValue === '' || labelValue === null || labelCategory === '' || labelCategory === null) {
      return null;
    }

    const existingLabel = LabelService.getRequiredLabelsAsArray(true).find(
      (label) => label.labelValue === labelValue && label.labelCategory === labelCategory
    );

    if (existingLabel === undefined || existingLabel.labelDefinition === undefined) {
      return null;
    } else {
      return existingLabel.labelDefinition;
    }
  }

  /**
   * Ensures that the repo has the required labels.
   * Compares the actual labels in the repo with the required labels. If an required label is missing,
   * it is added to the repo. If the required label exists but the label color is not as expected,
   * the color is updated. Does not delete actual labels that do not match required labels.
   * i.e., the repo might have more labels than the required labels after this operation.
   * @param actualLabels: labels in the repo.
   * @param requiredLabels: required labels.
   */
  private ensureRepoHasRequiredLabels(actualLabels: Label[], requiredLabels: Label[]): void {
    requiredLabels.forEach((label) => {
      // Finds for a label that has the same name as a required label.
      const nameMatchedLabels: Label[] = actualLabels.filter((remoteLabel) => remoteLabel.getFormattedName() === label.getFormattedName());

      if (nameMatchedLabels.length === 0) {
        // Create new Label (Could not find a label with the same name & category)
        this.githubService.createLabel(label.getFormattedName(), label.labelColor);
      } else if (nameMatchedLabels.length === 1) {
        if (nameMatchedLabels[0].equals(label)) {
          // the label exists exactly as expected -> do nothing
        } else {
          // the label exists but the color does not match -> update the required label's color to the one in github
          LabelService.updateRequiredLabelColor(nameMatchedLabels[0].labelColor, label);
        }
      } else {
        throw new Error('Unexpected error: the repo has multiple labels with the same name ' + label.getFormattedName());
      }
    });
    actualLabels.forEach((label) => {
      if (requiredLabels.findIndex((requiredLabel) => requiredLabel.getFormattedName() === label.getFormattedName()) === -1) {
        this.githubService.deleteLabel(label.getFormattedName());
      }
    });
  }

  /**
   * Converts a GithubLabel object to Label object.
   */
  toLabel(githubLabel: GithubLabel) {
    let labelCategory: string;
    let labelValue: string;

    const containsDotRegex = /\./g;
    const rawName: string = String(githubLabel.name);
    [labelCategory, labelValue] = containsDotRegex.test(rawName) ? githubLabel.name.split('.') : [undefined, rawName];

    const labelColor = githubLabel.color;
    const labelDefinition: string = String(githubLabel.description);

    return new Label(labelCategory, labelValue, labelColor, labelDefinition);
  }

  /**
   * Returns true if the given color is considered "dark"
   * The color is considered "dark" if its luminance is less than COLOR_DARKNESS_THRESHOLD
   * @param inputColor: the color
   */
  isDarkColor(inputColor: string): boolean {
    const COLOR = inputColor.charAt(0) === '#' ? inputColor.substring(1, 7) : inputColor;
    const R = parseInt(COLOR.substring(0, 2), 16);
    const G = parseInt(COLOR.substring(2, 4), 16);
    const B = parseInt(COLOR.substring(4, 6), 16);
    const RGB = [R / 255, G / 255, B / 255];
    const LINEAR_RGB = RGB.map((col) => {
      if (col <= 0.03928) {
        return col / 12.92;
      }
      return Math.pow((col + 0.055) / 1.055, 2.4);
    });
    // Calculate the luminance of the color
    const LUMINANCE = 0.2126 * LINEAR_RGB[0] + 0.7152 * LINEAR_RGB[1] + 0.0722 * LINEAR_RGB[2];
    // The color is "dark" if the luminance is lower than the threshold
    return LUMINANCE < COLOR_DARKNESS_THRESHOLD;
  }

  /**
   * Returns a css style for the label to use
   * @param color: the color of the label
   * @return the style with background-color in rgb
   * @throws exception if input is an invalid color code
   */
  setLabelStyle(color: string, display: string = 'inline-flex') {
    let textColor: string;

    textColor = this.isDarkColor(color) ? COLOR_WHITE : COLOR_BLACK;

    const styles = {
      'background-color': `#${color}`,
      'border-radius': '3px',
      cursor: 'default',
      padding: '3px',
      color: `#${textColor}`,
      'font-weight': '410',
      display: display
    };

    return styles;
  }
}
