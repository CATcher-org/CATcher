import { Injectable } from '@angular/core';
import {GithubService} from './github.service';
import {map} from 'rxjs/operators';
import {Label} from '../models/label.model';
import { Observable } from 'rxjs';
import {SEVERITY_ORDER} from '../../core/models/issue.model';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class LabelService {
  private severityLabels: Label[];
  private typeLabels: Label[];
  private responseLabels: Label[];
  private duplicateLabelMap: Map<string, boolean>;


  constructor(private githubService: GithubService) {
    this.severityLabels = new Array();
    this.typeLabels = new Array();
    this.responseLabels = new Array();
    this.duplicateLabelMap = new Map();
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
   * Get all the labels of a certain type (e.g severity)
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
        return this.responseLabels;
    }
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

      if (this.duplicateLabelMap.has(labelValue)) {
        continue;
      }

      this.duplicateLabelMap.set(labelValue, true);

      switch (labelType) {
        case 'severity':
          this.severityLabels.push({labelValue: labelValue, labelColor: labelColor});
          break;
        case 'type':
          this.typeLabels.push({labelValue: labelValue, labelColor: labelColor});
          break;
        case 'response':
          this.responseLabels.push({labelValue: labelValue, labelColor: labelColor});
          break;
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
    this.duplicateLabelMap.clear();
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
   * Generates a style for each label
   * @param color: the color of the label
   * @return the style for the label
   * @throws exception if hexToRgb returns null
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
