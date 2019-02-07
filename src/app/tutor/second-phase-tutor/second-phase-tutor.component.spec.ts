import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SecondPhaseTutorComponent } from './second-phase-tutor.component';

describe('SecondPhaseTutorComponent', () => {
  let component: SecondPhaseTutorComponent;
  let fixture: ComponentFixture<SecondPhaseTutorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SecondPhaseTutorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SecondPhaseTutorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
