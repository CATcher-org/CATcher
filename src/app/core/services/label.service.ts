import { Injectable } from '@angular/core';
import { GithubService } from './github.service';
import { map } from 'rxjs/operators';
import { Label } from '../models/label.model';
import { Observable } from 'rxjs';
import { ISSUE_LABELS, SEVERITY_ORDER } from '../../core/models/issue.model';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class LabelService {
  private severityLabels: Label[];
  private typeLabels: Label[];
  private responseLabels: Label[];
  private labelColorMap: Map<string, string>;

  private readonly DEFAULT_LABEL_COLOR = 'ededed';

  constructor(private githubService: GithubService) {
    this.severityLabels = new Array();
    this.typeLabels = new Array();
    this.responseLabels = new Array();
    this.labelColorMap = new Map();
  }

  /**
   * Calls the Github service api to get all labels from the repository and
   * store it in a list of arrays in this label service
   */
  getAllLabels(userResponse: User): Observable<User> {
      return this.githubService.fetchAllLabels().pipe(
        map((response) => {
          this.populateLabelLists(response);
          this.createMissingLabels();
          this.validateLabelColors();
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
   * Verifies that each label of its corresponding type exists in the current
   * repository and creates one if it does not exist.
   */
  private createMissingLabels(): void {
    for (const labelType of Object.keys(ISSUE_LABELS)) {
      const compulsoryLabels: string[] = ISSUE_LABELS[labelType];

      compulsoryLabels.forEach(labelName => {
        if (this.labelExists(labelType, labelName)) {
          return;
        }

        const color: string = this.getRandomLabelColour();

        // Update Local Data.
        this.getLabelList(labelType).push({labelValue: labelName, labelColor: color});
        this.labelColorMap.set(labelName, color);

        // Update Remote Data.
        this.githubService.createLabel(this.getFormattedLabelName(labelType, labelName), color);
      });
    }
  }

  /**
   * Verifies that every label has the correct color and updates a label's color
   * if otherwise.
   */
  private validateLabelColors(): void {
    for (const labelType of Object.keys(ISSUE_LABELS)) {

      this.getLabelList(labelType).forEach(label => {
        if (this.labelHasCorrectColor(labelType, label.labelValue)) {
          return;
        }

        const color: string = this.getRandomLabelColour();

        // Update Local Data
        label.labelColor = color;
        this.labelColorMap.set(label.labelValue, label.labelColor);

        // Update Remote Data.
        this.githubService.updateLabel(this.getFormattedLabelName(labelType, label.labelValue), color);
      });
    }
  }

  /**
   * Returns the default label name format.
   * @param labelType - Type that the given label belongs to.
   * @param labelName - Name of label that is to be formatted.
   */
  private getFormattedLabelName(labelType: string, labelName: string): string {
    return labelType + '.' + labelName;
  }

  /**
   * Returns true if specified labelName exists within its allocated type,
   * false if otherwise.
   * @param labelType - type of label (e.g. severity, .. )
   * @param labelName - name of label that is to be checked.
   */
  private labelExists(labelType: string, labelName: string): boolean {
    return this.getLabelList(labelType).filter(label => label.labelValue === labelName).length !== 0;
  }

  /**
   * Returns true if the specified label has a non-default color.
   * @param labelType - type of label (e.g. severity, .. )
   * @param labelName - name of label that is to be checked.
   */
  private labelHasCorrectColor(labelType: string, labelName: string): boolean {
    return this.getLabelList(labelType).filter(label => label.labelValue === labelName)
        .every(label => label.labelColor !== this.DEFAULT_LABEL_COLOR);
  }

  /**
   * Returns a random label colour.
   */
  private getRandomLabelColour(): string {
    return (0x1000000 + (Math.random()) * 0xffffff).toString(16).substr(1, 6);
  }

  /**
   * Stores the json data from Github api into the list of arrays in this service
   * @param labels: the json data of the label
   */
  private populateLabelLists(labels: Array<{}>): void {

    for (const label of labels) {
      // Get the name and color of each label and store them into the service's array list
      const labelName = String(label['name']).split('.');
      const labelType = labelName[0];
      const labelValue = labelName[1];
      const labelColor = String(label['color']);

      // Check for duplicate labels
      if (this.labelColorMap.has(labelValue)) {
        continue;
      }

      this.labelColorMap.set(labelValue, labelColor);
      const labelList = this.getLabelList(labelType);

      if (labelList !== undefined) {
        labelList.push({labelValue: labelValue, labelColor: labelColor});
      }

    }
    // Sort the severity labels from Low to High
    this.severityLabels.sort((a, b) => {
      return SEVERITY_ORDER[a.labelValue] - SEVERITY_ORDER[b.labelValue];
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
