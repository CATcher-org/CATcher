import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamResponseParseErrorComponent } from './team-response-parse-error.component';

describe('TeamResponseParseErrorComponent', () => {
  let component: TeamResponseParseErrorComponent;
  let fixture: ComponentFixture<TeamResponseParseErrorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TeamResponseParseErrorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TeamResponseParseErrorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
