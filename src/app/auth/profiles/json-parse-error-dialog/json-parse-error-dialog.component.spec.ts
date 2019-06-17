import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JsonParseErrorDialogComponent } from './json-parse-error-dialog.component';

describe('JsonParseErrorDialogComponent', () => {
  let component: JsonParseErrorDialogComponent;
  let fixture: ComponentFixture<JsonParseErrorDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JsonParseErrorDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JsonParseErrorDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
