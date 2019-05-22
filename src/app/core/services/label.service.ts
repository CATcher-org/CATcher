import { Injectable } from '@angular/core';
import {GithubService} from './github.service';
import {map} from 'rxjs/operators';
import {Label} from '../models/label.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LabelService {
  private severityLabels: Label[];
  private typeLabels: Label[];
  private responseLabels: Label[];
  private labelRetrieved: boolean;

  constructor(private githubService: GithubService) {
    this.severityLabels = new Array();
    this.typeLabels = new Array();
    this.responseLabels = new Array();
    this.labelRetrieved = false;
  }

  getAllLabels(): Observable<void> {
    return this.githubService.fetchAllLabels().pipe(
      map((response) => {
        return this.formatLabelList(response);
      })
    );
  }

  getLabelList(attributeName: string): Label[] {
    switch (attributeName) {
      case 'severity':
        return this.severityLabels;
      case 'type':
        return this.typeLabels;
      case 'response':
        return this.responseLabels;
    }
  }

  private formatLabelList(labels: Array<{}>): void {
    for (const label of labels) {

      const labelName = String(label['name']).split('.');
      const labelType = labelName[0];
      const labelValue = labelName[1];
      const labelColor = String(label['color']);

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
    this.labelRetrieved = true;
  }

  checkLabelRetrieved(): boolean {
    return this.labelRetrieved;
  }

  reset(): void {
    this.severityLabels.length = 0;
    this.typeLabels.length = 0;
    this.responseLabels.length = 0;
    this.labelRetrieved = false;
  }

}
