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
      case 'responseTag':
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

  hexToRgb(hex: string) {
    const rgbResult = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return rgbResult ? {
      r: parseInt(rgbResult[1], 16),
      g: parseInt(rgbResult[2], 16),
      b: parseInt(rgbResult[3], 16)
    } : null;
  }

  setLabelStyle(color: string) {
    const r = this.hexToRgb('#'.concat(color)).r.toString();
    const g = this.hexToRgb('#'.concat(color)).g.toString();
    const b = this.hexToRgb('#'.concat(color)).b.toString();

    const styles = {
      'background-color' : 'rgb('.concat(r).concat(', ').concat(g).concat(', ').concat(b).concat(', 0.6'),
      'border-radius' : '3px',
      'padding' : '3px',
    };
    return styles;
  }

}
