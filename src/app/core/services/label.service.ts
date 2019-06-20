import { Injectable } from '@angular/core';
import { GithubService } from './github.service';
import { map } from 'rxjs/operators';
import { Label } from '../models/label.model';
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

  // Preset Labels.
  private readonly REQUIRED_LABELS = {
    severity: {
      Low: new Label('severity', 'Low', 'ffb3b3'),
      Medium: new Label('severity', 'Medium', 'ff6666'),
      High: new Label('severity', 'High', 'b30000')
    },
    type: {
      DocumentationBug: new Label('type', 'DocumentationBug', 'ccb3ff'),
      FunctionalityBug: new Label('type', 'FunctionalityBug', '661aff')
    },
    response: {
      Accepted: new Label('response', 'Accepted', '80ffcc'),
      Rejected: new Label('response', 'Rejected', 'ff80b3'),
      IssueUnclear: new Label('response', 'IssueUnclear', 'ffcc80'),
      CannotReproduce: new Label('response', 'CannotReproduce', 'bfbfbf')
    },
    status: {
      Done: new Label('status', 'Done', 'b3ecff'),
      Incomplete: new Label('status', 'Incomplete', '1ac6ff')
    }
  };

  constructor(private githubService: GithubService) {
  }

  /**
   * Calls the Github service api to get all labels from the repository and
   * store it in a list of arrays in this label service
   */
  getAllLabels(userResponse: User): Observable<User> {
      return this.githubService.fetchAllLabels().pipe(
        map((response) => {
          this.storeLabelData(response, this.getRequiredLabels());
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
   * Returns an array of Preset Labels.
   */
  private getRequiredLabels(): Label[] {
    const requiredLabels: Label[] = [];

    for (const category of Object.keys(this.REQUIRED_LABELS)) {
      for (const labels of Object.values(this.REQUIRED_LABELS[category])) {
        requiredLabels.push(labels as Label);
      }
    }

    return requiredLabels;
  }

  /**
   * Stores the json data from Github api into the list of arrays in this service
   * @param labels: the json data of the label
   * @param expectedLabels: An array of labels that are required by the application.
   */
  private storeLabelData(labels: Array<{}>, expectedLabels: Label[]): void {

    // Parse Input Data to Label[]
    const labelData: Label[] = this.parseLabelData(labels);

    expectedLabels.forEach(label => {
      // Checks if remote data set already contains correct label.
      if (labelData.filter(remoteLabel => remoteLabel.equals(label)).length !== 0) {
        this.saveLabelData(label);
        return;
      }
      // Finds for a label that has a valid name & type but invalid color.
      const existingLabels: Label[] = labelData.filter(remoteLabel => remoteLabel.getFormattedName() === label.getFormattedName());
      if (existingLabels.length === 0) {
        // Create new Label (Could not find a label with the same name & category)
        this.githubService.createLabel(label.getFormattedName(), label.labelColor);
      } else if (existingLabels.length === 1) {
        // Update Label Color (Found a label with same name and category BUT it contains different color.)
        this.githubService.updateLabel(label.getFormattedName(), label.labelColor);
      } else {
        throw new Error('Label Assertion Error');
      }

      this.saveLabelData(label);
    });

    const sortingGroups: {labelArray: Label[], sortingFunction: (a: Label, b: Label) => number}[] = [];
    sortingGroups.push({labelArray: this.labelArrays.severity,
        sortingFunction: ((a, b) => SEVERITY_ORDER[a.labelValue] - SEVERITY_ORDER[b.labelValue])});
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
   * Saves label data to the relevant app data structures.
   * @param label - Label that is to be saved.
   */
  private saveLabelData(label: Label) {
    this.labelArrays[label.labelCategory].push(label);
    this.labelColorMap.set(label.labelValue, label.labelColor);
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
      const labelName: string[] = String(label['name']).split('.');
      const labelCategory: string = labelName[0];
      const labelValue: string = labelName[1];
      const labelColor: string = String(label['color']);

      labelData.push(new Label(labelCategory, labelValue, labelColor));
    }
    return labelData;
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
