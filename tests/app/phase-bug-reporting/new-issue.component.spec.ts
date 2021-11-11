import { FormBuilder } from '@angular/forms';
import { NewIssueComponent } from '../../../src/app/phase-bug-reporting/new-issue/new-issue.component';

describe('NewIssueComponent', () => {
  let newIssueComponent: NewIssueComponent;
  newIssueComponent = new NewIssueComponent(null, new FormBuilder(), null, null, null);

  describe('.isAttributeEditing()', () => {
    beforeEach(() => {
      newIssueComponent.ngOnInit();
    });

    it('should return false if the field is not edited', () => {
      expect(newIssueComponent.isAttributeEditing(newIssueComponent.title)).toBeFalse();
    });

    it('should return true if the corresponding field is edited', () => {
      newIssueComponent.newIssueForm.get('title').setValue('Test title');
      expect(newIssueComponent.isAttributeEditing(newIssueComponent.title)).toBeTrue();
    });

    it('should return false if the corresponding field is edited but then the change is undone', () => {
      newIssueComponent.newIssueForm.get('title').setValue('Test title');
      // undo the change by deleting the title, essentially is the same as set it back to an empty string
      newIssueComponent.newIssueForm.get('title').setValue('');
      expect(newIssueComponent.isAttributeEditing(newIssueComponent.title)).toBeFalse();
    });
  });

  describe('.canDeactivate()', () => {
    beforeEach(() => {
      newIssueComponent.ngOnInit();
    });

    it('should return true if the none of the fields is edited', () => {
      expect(newIssueComponent.canDeactivate()).toBeTrue();
    });

    it('should return false if one of the fields is edited', () => {
      newIssueComponent.newIssueForm.get('title').setValue('Test title');
      expect(newIssueComponent.canDeactivate()).toBeFalse();
    });

    it('should return false if any two of the fields are edited', () => {
      newIssueComponent.newIssueForm.get('title').setValue('Test title');
      newIssueComponent.newIssueForm.get('description').setValue('Test description');
      expect(newIssueComponent.canDeactivate()).toBeFalse();
    });

    it('should return false if any three of the fields are edited', () => {
      newIssueComponent.newIssueForm.get('title').setValue('Test title');
      newIssueComponent.newIssueForm.get('description').setValue('Test description');
      newIssueComponent.newIssueForm.get('severity').setValue('severity.High');
      expect(newIssueComponent.canDeactivate()).toBeFalse();
    });

    it('should return false if all four of the fields are edited', () => {
      newIssueComponent.newIssueForm.get('title').setValue('Test title');
      newIssueComponent.newIssueForm.get('description').setValue('Test description');
      newIssueComponent.newIssueForm.get('severity').setValue('severity.High');
      newIssueComponent.newIssueForm.get('type').setValue('type.DocumentationBug');
      expect(newIssueComponent.canDeactivate()).toBeFalse();
    });

    it('should return true if a field is edited but then the change is undone', () => {
      newIssueComponent.newIssueForm.get('title').setValue('Test title');
      // undo the change by deleting the title, essentially is the same as set it back to an empty string
      newIssueComponent.newIssueForm.get('title').setValue('');
      expect(newIssueComponent.canDeactivate()).toBeTrue();
    });
  });
});
