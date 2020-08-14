import { LabelDropdownComponent } from '../../../../src/app/shared/label-dropdown/label-dropdown.component';
import { LabelService } from '../../../../src/app/core/services/label.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Label } from '../../../../src/app/core/models/label.model';

describe('LabelDropdownComponent', () => {

  let labelDropdownComponent: LabelDropdownComponent;
  let labelService: any;
  beforeEach(() => {
    labelService = jasmine.createSpyObj(LabelService, ['getLabelList', 
      'getColorOfLabel', 'isDarkColor']);

    const formGroup: FormGroup = new FormBuilder().group(({
      title: ['', Validators.required],
      description: ['No details provided.'],
      severity: ['', Validators.required],
      type: ['', Validators.required],
    }));

    labelDropdownComponent = new LabelDropdownComponent(labelService);
    labelDropdownComponent.dropdownForm = formGroup;
  })

  it('should initialise its label list', () => {
    labelDropdownComponent.attributeName = 'severity';
    labelDropdownComponent.initialValue = '';
    const labels: Label[] = [new Label('severity', 'High', 'ff6666')];
    labelService.getLabelList.and.returnValue(labels);
    labelService.getColorOfLabel.and.returnValue('ff6666');

    labelDropdownComponent.ngOnInit();
    expect(labelDropdownComponent.labelList).toEqual(labels);
    expect(labelDropdownComponent.selectedColor).toEqual('ff6666');
  });

  it('should change color upon selection change event', () => {
    
  }


});