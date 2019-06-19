import { Injectable } from '@angular/core';
import { GithubService } from './github.service';
import { map } from 'rxjs/operators';
import { Label, LABEL_CATEGORY, LABEL_COLORS, LABEL_VALUES } from '../models/label.model';
import { Observable } from 'rxjs';
import { SEVERITY_ORDER } from '../../core/models/issue.model';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class LabelService {
  private severityLabels: Label[] = [];
  private typeLabels: Label[] = [];
  private responseLabels: Label[] = [];
  private statusLabels: Label[] = [];
  private labelArrays = {
    severity: this.severityLabels,
    type: this.typeLabels,
    response: this.responseLabels,
    status: this.statusLabels
  };
  private labelColorMap: Map<string, string> = new Map();

  constructor(private githubService: GithubService) {
  }

  /**
   * Calls the Github service api to get all labels from the repository and
   * store it in a list of arrays in this label service
   */
  getAllLabels(userResponse: User): Observable<User> {
      return this.githubService.fetchAllLabels().pipe(
        map((response) => {
          this.storeLabelData(response);
          return userResponse;
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
        return this.severityLabels;
      case 'type':
        return this.typeLabels;
      case 'responseTag':
      case 'response':
        return this.responseLabels;
    }
  }

  /**
   * Returns the color of the label using the label-color mapping
   * @param labelValue: the label's value (e.g Low / Medium / High)
   * @return a string with the color code of the label, or white color if
   * no labelValue was provided or no such mapping was found
   */
  getColorOfLabel(labelValue: string): string {
    const color = this.labelColorMap.get(labelValue);

    if (color === undefined || labelValue === '') {
      return 'ffffff';
    }

    return color;
  }

  /**
   * Returns the default label name format.
   * @param labelCategory - Type that the given label belongs to.
   * @param labelName - Name of label that is to be formatted.
   */
  private getFormattedLabelName(labelCategory: string, labelName: string): string {
    return labelCategory + '.' + labelName;
  }

  /**
   * Stores the json data from Github api into the list of arrays in this service
   * @param labels: the json data of the label
   */
  private storeLabelData(labels: Array<{}>): void {

    // Parse Input Data to Label[]
    let labelData: Label[] = this.parseLabelData(labels);

    // Valdiate parsed Label[]
    labelData = this.validateLabelData(labelData);

    // Populate Color Map
    this.populateColorMap(labelData);

    // Populate Category Label Arrays
    this.populateLabelArrays(labelData);

    // Sort Category Label Arrays
    const sortingGroups: {labelArray: Label[], sortingFunction: (a: Label, b: Label) => number}[] = [];
    sortingGroups
      .push({labelArray: this.severityLabels, sortingFunction: ((a, b) => SEVERITY_ORDER[a.labelValue] - SEVERITY_ORDER[b.labelValue])});
    this.sortLabelArrays(sortingGroups);
  }

  /**
   * Sorts the given array of Labels with the given callback function.
   * @param toSort - Array of Objects that contain this Label Array and Callback Function (specific to sorting the labels).
   */
  private sortLabelArrays(toSort: {labelArray: Label[], sortingFunction: (a: Label, b: Label) => number}[]): void {
    toSort.forEach(sortingGroup => sortingGroup.labelArray.sort(sortingGroup.sortingFunction));
  }

  /**
   * Store labels of each particular category in their respective arrays.
   * @param labels - Array of all labels.
   */
  private populateLabelArrays(labels: Label[]): void {
    for (const category of Object.values(LABEL_CATEGORY)) {
      const categoryArray: Label[] = this.labelArrays[category];
      categoryArray.push(...labels.filter(label => label.labelCategory === LABEL_CATEGORY[category]));
    }
  }

  /**
   * Parses label information into Label objects.
   * @param labels - API Label Information.
   * @return labelData - Array of parsed labels.
   */
  parseLabelData(labels: Array<{}>): Label[] {
    // Parse Input Data to Label[]
    const labelData: Label[] = [];
    for (const label of labels) {
      // Get the name and color of each label and store them into the service's array list
      const labelName = String(label['name']).split('.');
      const labelCategory = labelName[0];
      const labelValue = labelName[1];
      const labelColor = String(label['color']);

      labelData.push({labelValue: labelValue, labelColor: labelColor, labelCategory: LABEL_CATEGORY[labelCategory]});
    }
    return labelData;
  }

  /**
   * Performs several label validation checks.
   * @param labels - Set of labels that needs validation.
   */
  validateLabelData(labels: Label[]): Label[] {
    // Remove Invalid Labels from Dataset.
    labels = this.removeInvalidLabels(labels);
    // Colors Verification.
    this.verifyLabelColors(labels);
    // Fill Missing Labels if any
    this.fillMissingLabels(labels);
    return labels;
  }

  /**
   * Compares the provided array of labels with the required array
   * and creates any labels that may be missing from the provided set.
   * @param labels - Provided array of labels.
   */
  private fillMissingLabels(labels: Label[]): void {
    for (const category of Object.keys(LABEL_VALUES)) {
      const categoryValues: string[] = (Object.values(LABEL_VALUES[category]));
      const categoryLabels: Label[] = labels.filter(label => label.labelCategory === LABEL_CATEGORY[category]);

      for (const name of categoryValues) {
        if (categoryLabels.filter(label => label.labelValue === name).length !== 0) {
          continue;
        }
        const newLabel: Label = {labelValue: name, labelCategory: LABEL_CATEGORY[category],
            labelColor: this.getCorrectLabelColor(name, LABEL_CATEGORY[category])};
        labels.push(newLabel);
        this.githubService.createLabel(this.getFormattedLabelName(newLabel.labelCategory, newLabel.labelValue), newLabel.labelColor);
      }

    }
  }

  /**
   * Checks that each label is correctly colored.
   * @param labels - Set of labels that need color verification.
   */
  private verifyLabelColors(labels: Label[]): void {
    labels.forEach(label => {
      if (this.isCorrectLabelColor(label)) {
        return;
      }
      label.labelColor = this.getCorrectLabelColor(label.labelValue, label.labelCategory);

      this.githubService.updateLabel(this.getFormattedLabelName(label.labelCategory, label.labelValue), label.labelColor);
    });
  }

  /**
   * Remove labels that are not recognized by the application.
   * @param labels - Data set of Labels.
   */
  private removeInvalidLabels(labels: Label[]): Label[] {
    return labels.filter(label => this.isValidLabel(label));
  }

  /**
   * Returns the correct label color for the specific label.
   * @param labelName - Name of label.
   * @param labelCategory - Category that the label belongs to.
   */
  private getCorrectLabelColor(labelName: string, labelCategory: LABEL_CATEGORY): string {
    return LABEL_COLORS[labelCategory][labelName];
  }

  /**
   * Returns true if Label is correctly colored.
   * @param label - Label that needs it's color to be checked.
   */
  private isCorrectLabelColor(label: Label): boolean {
    return LABEL_COLORS[label.labelCategory][label.labelValue] === label.labelColor;
  }

  /**
   * Returns true if a Label satisfies a set of validity checks.
   * @param label - Label that needs to be validated.
   */
  private isValidLabel(label: Label): boolean {
    return this.isValidCategory(label) && this.isValidName(label);
  }

  /**
   * Returns true if Label has a valid category.
   * @param label - Label that needs its category verified.
   */
  private isValidCategory(label: Label): boolean {
    return LABEL_CATEGORY[label.labelCategory] !== undefined;
  }

  /**
   * Returns true if Label has a valid name.
   * @param label - Label that needs its name verified.
   */
  private isValidName(label: Label): boolean {
    return LABEL_VALUES[label.labelCategory][label.labelValue] !== undefined;
  }

  /**
   * Populates the labelName to labelColor map.
   * @param labels - Labels data set.
   */
  private populateColorMap(labels: Label[]): void {
    labels.forEach(label => {
      this.labelColorMap.set(label.labelValue, label.labelColor);
    });
  }

  reset(): void {
    this.severityLabels.length = 0;
    this.typeLabels.length = 0;
    this.responseLabels.length = 0;
    this.labelColorMap.clear();
  }

  /**
   * Converts the (color) hex value into RGB format
   * @param hex: the hex value
   */
  hexToRgb(hex: string) {
    const rgbResult = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return rgbResult ? {
      r: parseInt(rgbResult[1], 16),
      g: parseInt(rgbResult[2], 16),
      b: parseInt(rgbResult[3], 16)
    } : null;
  }

  /**
   * Returns a css style for the label to use
   * @param color: the color of the label
   * @return the style with background-color in rgb
   * @throws exception if input is an invalid color code
   */
  setLabelStyle(color: string) {
    let r: string;
    let g: string;
    let b: string;
    const white = '255';

    try {
      r = this.hexToRgb('#'.concat(color)).r.toString();
      g = this.hexToRgb('#'.concat(color)).g.toString();
      b = this.hexToRgb('#'.concat(color)).b.toString();
    } catch (e) {
      // Set rgb to white color if hexToRgb returns null
      r = white;
      g = white;
      b = white;
    }

    const styles = {
      'background-color' : `rgb(${r}, ${g}, ${b}, 0.55)`,
      'border-radius' : '3px',
      'padding' : '3px',
    };

    return styles;
  }

}
