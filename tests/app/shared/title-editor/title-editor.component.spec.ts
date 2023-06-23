import { CUSTOM_ELEMENTS_SCHEMA, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { SharedModule } from '../../../../src/app/shared/shared.module';
import { TitleEditorComponent } from '../../../../src/app/shared/issue/title-editor/title-editor.component';

describe('CommentEditor', () => {
  let fixture: ComponentFixture<TitleEditorComponent>;
  let debugElement: DebugElement;
  let component: TitleEditorComponent;

  const TEST_INITIAL_TITLE = 'abc';

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

      fixture.whenStable().then(() => {
        expect(textBox.value).toEqual('123');
      });
    });
  });
});
