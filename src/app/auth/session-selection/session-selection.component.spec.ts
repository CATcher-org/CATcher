import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SessionSelectionComponent } from './session-selection.component';

describe('SessionSelectionComponent', () => {
  let component: SessionSelectionComponent;
  let fixture: ComponentFixture<SessionSelectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SessionSelectionComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SessionSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
