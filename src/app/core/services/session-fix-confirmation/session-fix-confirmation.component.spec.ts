import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SessionFixConfirmationComponent } from './session-fix-confirmation.component';

describe('SessionFixConfirmationComponent', () => {
  let component: SessionFixConfirmationComponent;
  let fixture: ComponentFixture<SessionFixConfirmationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SessionFixConfirmationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SessionFixConfirmationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
