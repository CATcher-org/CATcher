import { Injectable } from '@angular/core';
import { GithubService } from './github.service';
import { map } from 'rxjs/operators';
import { Label } from '../models/label.model';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class LabelService {

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

  private severityLabels: Label[] = Object.values(this.REQUIRED_LABELS.severity);
  private typeLabels: Label[] = Object.values(this.REQUIRED_LABELS.type);
  private responseLabels: Label[] = Object.values(this.REQUIRED_LABELS.response);
  private statusLabels: Label[] = Object.values(this.REQUIRED_LABELS.status);
  private labelArrays = {
    severity: this.severityLabels,
    type: this.typeLabels,
    response: this.responseLabels,
    status: this.statusLabels
  };

  constructor(private githubService: GithubService) {
  }

  /**
   * Calls the Github service api to get all labels from the repository and
   * store it in a list of arrays in this label service
   */
  synchronizeRemoteLabels(userResponse: User): Observable<User> {
      return this.githubService.fetchAllLabels().pipe(
        map((response) => {
          this.ensureRepoHasExpectedLabels(this.parseLabelData(response), this.getRequiredLabels());
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
   * Returns the color of the label by iterating through the list of
   * available labels.
   * @param labelValue: the label's value (e.g Low / Medium / High)
   * @return a string with the color code of the label or a white color if
   * no labelValue was provided or the color
   */
  getColorOfLabel(labelValue: string): string {
    const WHITE_COLOR = 'ffffff';
    if (labelValue === '') {
      return WHITE_COLOR;
    }

    for (const category of Object.keys(this.labelArrays)) {

      const labels = this.labelArrays[category] as Label[];
      const existingLabel = labels.find(label => label.labelValue === labelValue);

      if (existingLabel === undefined) {
        // If requested label cannot be found in current list, move to the next one.
        continue;
      } else if (existingLabel.labelColor === undefined) {
        return WHITE_COLOR;
      } else {
        return existingLabel.labelColor;
      }
    }

    // Finally returns white if the requested label cannot be found in any of the
    // available list of labels.
    return WHITE_COLOR;
  }

  /**
   * Returns an array of Labels required by the application.
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
   * Ensures that the repo has the expected labels.
   * Compares the actual labels in the repo with expected labels. If an expected label is missing,
   * it is added to the repo. If the expected label exists but the label color is not as expected,
   * the color is updated. Does not delete actual labels that do not match expected labels.
   * i.e., the repo might have more labels than the expected labels after this operation.
   * @param actualLabels: labels in the repo.
   * @param expectedLabels: expected labels.
   */
  private ensureRepoHasExpectedLabels(actualLabels: Label[], expectedLabels: Label[]): void {

    expectedLabels.forEach(label => {

      // Finds for a label that has the same name as a required label.
      const nameMatchedLabels: Label[] = actualLabels.filter(remoteLabel =>
          remoteLabel.getFormattedName() === label.getFormattedName());

      if (nameMatchedLabels.length === 0) {
        // Create new Label (Could not find a label with the same name & category)
        this.githubService.createLabel(label.getFormattedName(), label.labelColor);
      } else if (nameMatchedLabels.length === 1) {
        if (nameMatchedLabels[0].equals(label)) {
          // the label exists exactly as expected -> do nothing
        } else {
          // the label exists but the color does not match
          this.githubService.updateLabel(label.getFormattedName(), label.labelColor);
        }
      } else {
        throw new Error('Unexpected error: the repo has multiple labels with the same name ' + label.getFormattedName());
      }

    });
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
