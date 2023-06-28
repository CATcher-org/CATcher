import { CUSTOM_ELEMENTS_SCHEMA, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { TitleEditorComponent } from '../../../../../src/app/shared/issue/title-editor/title-editor.component';
import { SharedModule } from '../../../../../src/app/shared/shared.module';

describe('TitleEditor', () => {
  let fixture: ComponentFixture<TitleEditorComponent>;
  let debugElement: DebugElement;
  let component: TitleEditorComponent;

  const TEST_INITIAL_TITLE = 'abc';
  const TEST_257_CHARS = '0'.repeat(257);

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TitleEditorComponent],
      imports: [FormsModule, SharedModule, BrowserAnimationsModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(TitleEditorComponent);
    debugElement = fixture.debugElement;
    component = fixture.componentInstance;

    // initialize compulsory inputs
    const titleField: FormControl = new FormControl('');
    const titleForm: FormGroup = new FormGroup({
      title: titleField
    });
    const id = 'title';

    // manually inject inputs into the component
    component.titleField = titleField;
    component.titleForm = titleForm;
    component.id = id;
  });

  describe('text input box', () => {
    it('should render', () => {
      fixture.detectChanges();

      const textBoxDe: DebugElement = debugElement.query(By.css('input'));
      expect(textBoxDe).toBeTruthy();
    });

    it('should contain an empty string if no initial description is provided', () => {
      fixture.detectChanges();

      const textBox: any = debugElement.query(By.css('input')).nativeElement;
      expect(textBox.value).toEqual('');
    });

    it('should contain an initial description if one is provided', () => {
      component.initialTitle = TEST_INITIAL_TITLE;
      fixture.detectChanges();

      const textBox: any = debugElement.query(By.css('input')).nativeElement;
      expect(textBox.value).toEqual(TEST_INITIAL_TITLE);
    });

    it('should allow users to input text', async () => {
      fixture.detectChanges();

      const textBox: any = debugElement.query(By.css('input')).nativeElement;
      textBox.value = '123';
      textBox.dispatchEvent(new Event('input'));

      await fixture.whenStable().then(() => {
        expect(textBox.value).toEqual('123');
      });
    });

    it('should undo a change on undo input', () => {
      fixture.detectChanges();

      const textBox: any = debugElement.query(By.css('input')).nativeElement;

      // saves empty state: { text: '', selectStart: 0, selectEnd: 0 }
      component.history.forceSave();

      textBox.value = '123';
      // saves state: { text: '123', selectStart: 3, selectEnd: 3 }
      component.history.forceSave();

      // undo to empty state: { text: '', selectStart: 0, selectEnd: 0 }
      textBox.dispatchEvent(new KeyboardEvent('keydown', {key: 'z', code: 'KeyZ', ctrlKey: true}));

      fixture.whenStable().then(() => {
        expect(textBox.value).toEqual('');
      });
    });

    it('should redo an undone change on redo input', () => {
      fixture.detectChanges();

      const textBox: any = debugElement.query(By.css('input')).nativeElement;

      // saves empty state: { text: '', selectStart: 0, selectEnd: 0 }
      component.history.forceSave();

      textBox.value = '123';
      // saves state: { text: '123', selectStart: 3, selectEnd: 3 }
      component.history.forceSave();

      // undo to empty state: { text: '', selectStart: 0, selectEnd: 0 }
      textBox.dispatchEvent(new KeyboardEvent('keydown', {key: 'z', code: 'KeyZ', ctrlKey: true}));

      // redo to state: { text: '123', selectStart: 3, selectEnd: 3 }
      textBox.dispatchEvent(new KeyboardEvent('keydown', {key: 'y', code: 'KeyY', ctrlKey: true}));

      fixture.whenStable().then(() => {
        expect(textBox.value).toEqual('123');
      });
    });

    it('blank input should be invalid', () => {
      fixture.autoDetectChanges();

      fixture.whenStable().then(() => {
        expect(component.titleField.valid).toBe(false);
        expect(component.titleField.hasError('required')).toEqual(true);
      });
    });

    it('input of more than 256 characters should be invalid', async () => {
      fixture.detectChanges();

      const textBox: any = debugElement.query(By.css('input')).nativeElement;
      textBox.value = TEST_257_CHARS;
      textBox.dispatchEvent(new Event('input'));

      await fixture.whenStable().then(() => {
        expect(component.titleField.valid).toBe(false);
        expect(component.titleField.hasError('maxlength')).toEqual(true);
      });
    });
  });
});
