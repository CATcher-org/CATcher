import { Injectable } from '@angular/core';
import { GithubService } from './github.service';
import { map } from 'rxjs/operators';
import { Label } from '../models/label.model';
import { Observable } from 'rxjs';
import { SEVERITY_ORDER } from '../../core/models/issue.model';
import { User } from '../models/user.model';

/* The threshold to decide if color is dark or light.
A higher threshold value will result in more colors determined to be "dark".
W3C recommendation is 0.179, but 0.184 is chosen so that some colors (like bright red)
are considered dark (Github too consider them dark) */
const COLOR_DARKNESS_THRESHOLD = 0.184;

const COLOR_DARK_TEXT  = '000000'; // Dark color for text with light background
const COLOR_LIGHT_TEXT  = 'FFFFFF'; // Light color for text with dark background

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
   * Returns true if the given color is considered "dark"
   * The color is considered "dark" if its luminance is less than COLOR_DARKNESS_THRESHOLD
   * @param inputColor: the color
   */
  isDarkColor(inputColor: string): boolean {
    const COLOR = (inputColor.charAt(0) === '#') ? inputColor.substring(1, 7) : inputColor;
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
    const LUMINANCE = (0.2126 * LINEAR_RGB[0]) + (0.7152 * LINEAR_RGB[1]) + (0.0722 * LINEAR_RGB[2]);
    // The color is "dark" if the luminance is lower than the threshold
    return (LUMINANCE < COLOR_DARKNESS_THRESHOLD);
  }

  /**
   * Returns a css style for the label to use
   * @param color: the color of the label
   * @return the style with background-color in rgb
   * @throws exception if input is an invalid color code
   */
  setLabelStyle(color: string) {
    let textColor: string;

    textColor = (this.isDarkColor(color)) ? COLOR_LIGHT_TEXT : COLOR_DARK_TEXT;

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
