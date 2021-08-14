import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmLoginComponent } from './confirm-login.component';

describe('ConfirmLoginComponent', () => {
  let component: ConfirmLoginComponent;
  let fixture: ComponentFixture<ConfirmLoginComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConfirmLoginComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
