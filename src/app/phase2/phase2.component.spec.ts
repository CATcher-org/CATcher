import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Phase2Component } from './phase2.component';

describe('Phase2Component', () => {
  let component: Phase2Component;
  let fixture: ComponentFixture<Phase2Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Phase2Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Phase2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
