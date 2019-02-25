import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Phase3Component } from './phase3.component';

describe('Phase3Component', () => {
  let component: Phase3Component;
  let fixture: ComponentFixture<Phase3Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Phase3Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Phase3Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
