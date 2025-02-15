import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';
import { DialogService } from '../..//core/services/dialog.service';
import { Attribute, ATTRIBUTE } from '../../core/models/issue.model';
import { Label } from '../../core/models/label.model';
import { LabelService } from '../../core/services/label.service';

export const WHITE_TEXT_CLASS = 'white-text';
export const BLACK_TEXT_CLASS = 'black-text';

@Component({
  selector: 'app-label-dropdown',
  templateUrl: './label-dropdown.component.html',
  styleUrls: ['./label-dropdown.component.css']
})
export class LabelDropdownComponent implements OnInit {
  dropdownControl: AbstractControl;
  @Input() attributeName: Attribute;
  @Input() initialValue: string;
  @Input() dropdownForm: FormGroup;

  selectedColor: string;
  labelList: Label[];

  constructor(public labelService: LabelService, public dialogService: DialogService) {}

  ngOnInit() {
    this.selectedColor = this.labelService.getColorOfLabel(this.attributeName, this.initialValue);
    this.labelList = this.labelService.getLabelList(this.attributeName as Attribute);
    this.dropdownControl = this.dropdownForm.get(this.attributeName);
  }

  setSelectedLabelColor(attributeName: Attribute, labelValue: string) {
    this.selectedColor = this.labelService.getColorOfLabel(attributeName, labelValue);
  }

  openModalPopup(label: Label): void {
    this.dialogService.openLabelDefinitionDialog(
      label.getFormattedName(),
      this.labelService.getLabelDefinition(label.labelValue, label.labelCategory)
    );
  }

  hasLabelDefinition(label: Label): boolean {
    return this.labelService.getLabelDefinition(label.labelValue, label.labelCategory) !== null;
  }

  get dropdownTextColor(): string {
    return this.labelService.isDarkColor(this.selectedColor) ? WHITE_TEXT_CLASS : BLACK_TEXT_CLASS;
  }
}
