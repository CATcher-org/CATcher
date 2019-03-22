import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TutorResponseComponent } from './tutor-response.component';

describe('TutorResponseComponent', () => {
  let component: TutorResponseComponent;
  let fixture: ComponentFixture<TutorResponseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TutorResponseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TutorResponseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
