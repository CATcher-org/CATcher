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
   * Synchronizes the labels in github with those required by the application.
   */
  synchronizeRemoteLabels(userResponse: User): Observable<User> {
      return this.githubService.fetchAllLabels().pipe(
        map((response) => {
          this.ensureRepoHasRequiredLabels(this.parseLabelData(response), this.getRequiredLabelsAsArray());
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
   * Returns the color of the label by searching a list of
   * all available labels.
   * @param labelValue: the label's value (e.g Low / Medium / High / ...)
   */
  getColorOfLabel(labelValue: string): string {
    // TODO: Rewrite function - labelValue insufficient to differentiate between labels. Should use `labelCategory.labelValue` format.
    const WHITE_COLOR = 'ffffff';
    if (labelValue === '') {
      return WHITE_COLOR;
    }

    const existingLabel = this.getRequiredLabelsAsArray().find(label => label.labelValue === labelValue);

    if (existingLabel === undefined || existingLabel.labelColor === undefined) {
      return WHITE_COLOR;
    } else {
      return existingLabel.labelColor;
    }
  }

  private getRequiredLabelsAsArray(): Label[] {
    let requiredLabels: Label[] = [];

    for (const category of Object.keys(this.labelArrays)) {
      requiredLabels = requiredLabels.concat(this.labelArrays[category]);
    }

    return requiredLabels;
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

    requiredLabels.forEach(label => {

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
   * Parses label information and returns an array of Label objects.
   * @param labels - Label Information from API.
   */
  parseLabelData(labels: Array<{}>): Label[] {
    const labelData: Label[] = [];
    for (const label of labels) {

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
