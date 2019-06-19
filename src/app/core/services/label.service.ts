import { Injectable } from '@angular/core';
import { GithubService } from './github.service';
import { map } from 'rxjs/operators';
import { Label } from '../models/label.model';
import { Observable } from 'rxjs';
import { SEVERITY_ORDER } from '../../core/models/issue.model';
import { User } from '../models/user.model';

const BGCOLOR_THRESHOLD = 0.199; // The threshold to decide if text color will be black or white

@Injectable({
  providedIn: 'root'
})
export class LabelService {
  private severityLabels: Label[];
  private typeLabels: Label[];
  private responseLabels: Label[];
  private labelColorMap: Map<string, string>;


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
   * Chooses light or dark text color depending on background color
   * @param bgColor: the color code of the background
   * @return a string with light or dark color code
   */
  pickTextColorBasedOnBgColor(bgColor: string) {
    const lightColor = 'FFFFFF'; // Light text color (white)
    const darkColor = '000000'; // Dark text color (black)
    const color = (bgColor.charAt(0) === '#') ? bgColor.substring(1, 7) : bgColor;
    const r = parseInt(color.substring(0, 2), 16);
    const g = parseInt(color.substring(2, 4), 16);
    const b = parseInt(color.substring(4, 6), 16);
    const uiColors = [r / 255, g / 255, b / 255];
    const c = uiColors.map((col) => {
      if (col <= 0.03928) {
        return col / 12.92;
      }
      return Math.pow((col + 0.055) / 1.055, 2.4);
    });
    // Calculate the luminance of the background color
    const L = (0.2126 * c[0]) + (0.7152 * c[1]) + (0.0722 * c[2]);
    // Higher threshold will result in more labels with light color text
    return (L > BGCOLOR_THRESHOLD) ? darkColor : lightColor;
  }

  /**
   * Returns a css style for the label to use
   * @param color: the color of the label
   * @return the style with background-color in rgb
   * @throws exception if input is an invalid color code
   */
  setLabelStyle(color: string) {
    const textColor = this.pickTextColorBasedOnBgColor(color);

    const styles = {
      'background-color' : `#${color}`,
      'border-radius' : '3px',
      'padding' : '3px',
      'color' : `#${textColor}`,
      'font-weight' : '410',
    };

    return styles;
  }

}
