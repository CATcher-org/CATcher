import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IssuesRespondedComponent } from './issues-responded.component';

describe('IssuesRespondedComponent', () => {
  let component: IssuesRespondedComponent;
  let fixture: ComponentFixture<IssuesRespondedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IssuesRespondedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IssuesRespondedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
